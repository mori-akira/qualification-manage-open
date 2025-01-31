// 定数の定義
const FILE_PATH = './data.json';
const TARGET_META_NAME = 'target';
const DATE_FORMAT = 'sv-SE';
const RANKS = ['A', 'B', 'C', 'D'];
const FIELD_LABELS = ['資格名', 'ランク', '提供団体', '取得日', '期限日'];

// データの取得
const fetchData = async (filePath) => {
    const response = await fetch(filePath);
    return response.json();
};

// 表示対象の項目を取得
const getTargets = () => {
    return $('meta[name="' + TARGET_META_NAME + '"]').attr('content').split(',');
};

// 期限切れかどうかの判定
const isExpired = (dateString) => {
    const today = new Date().toLocaleDateString(DATE_FORMAT);
    return dateString && today > dateString;
};

// テーブル行の生成
const createTableRow = (e, index, expired) => {
    const tr = $(`<tr data-target="id_${index}"><td>${index}</td></tr>`);
    if (expired) {
        tr.addClass('expired');
    }
    FIELD_LABELS.forEach(f => {
        if (f === 'ランク') {
            const rank = e.find(g => f === g.label)?.value ?? '-';
            tr.append($(`<td><span class="value rank ${rank}">${rank}</span></td>`));
        } else {
            tr.append($(`<td>${e.find(g => f === g.label)?.value ?? '-'}</td>`));
        }
    });
    return tr;
};

// 詳細情報の生成
const createDetailInfo = (e, index) => {
    const detail = $(`<h2 id="id_${index}">${e.find(f => '資格名' === f.label)?.value ?? '-'}</h2>`);
    const div = $('<div class="qualification-info"></div>');
    e.forEach(f => {
        if ('type' === f.type) return;
        div.append($(`<span>${f.label}</span>`));
        switch (f.type) {
            case 'text':
                div.append($(`<span>${f.value}</span><br>`));
                break;
            case 'anchor-row':
                div.append($(`<span><a href="${f.value}" target="_blank">${f.value}</a></span><br>`));
                break;
            case 'anchor-label':
                div.append($(`<span><a href="${f.value}" target="_blank">${f.label}</a></span><br>`));
                break;
            case 'anchor-auth':
                const target = btoa(encodeURIComponent(f.value));
                div.append($(`<span><a href="./auth.html?target=${target}" target="_blank">${f.label}</a></span><br>`));
                break;
            default:
                div.append($(`<span>${f.value}</span><br>`));
                break;
        }
    });
    return { detail, div };
};

// ランクカウントの更新
const updateRankCount = (rankCount, rank, expired) => {
    if (rank && !expired) {
        rankCount[rank]++;
    }
};

// 資格サマリの更新
const updateSummary = (rankCount) => {
    RANKS.forEach(rank => {
        $(`#${rank}-rank`).text(rankCount[rank]);
    });
};

// イベントリスナーの設定
const setEventListeners = () => {
    $('table.qualification-list > tbody > tr').each((_, e) => {
        const target = $(e).attr('data-target');
        if (target) {
            $(e).click(() => {
                $(window).scrollTop($(`#${target}`).position().top);
            });
        }
    });
};

// DataTableの初期化
const initializeDataTable = () => {
    $('.qualification-list').DataTable({
        lengthChange: false,
        searching: true,
        ordering: true,
        info: false,
        paging: false
    });
};

// メイン関数
const main = async () => {
    const data = await fetchData(FILE_PATH);
    const targets = getTargets();
    const infoTable = $('#info-table').children('tbody');
    const infoList = $('#info-list');
    let index = 1;
    const rankCount = { 'A': 0, 'B': 0, 'C': 0, 'D': 0 };

    data.forEach(e => {
        const type = e.find(f => 'type' === f.type)?.value;
        if (!targets.includes(type)) return;

        const expired = isExpired(e.find(f => '期限日' === f.label)?.value);
        infoTable.append(createTableRow(e, index, expired));
        const { detail, div } = createDetailInfo(e, index);
        infoList.append(detail);
        infoList.append(div);

        updateRankCount(rankCount, e.find(f => 'ランク' === f.label)?.value, expired);
        index++;
    });

    updateSummary(rankCount);
    setEventListeners();
    initializeDataTable();
};

// 実行
$(main);
