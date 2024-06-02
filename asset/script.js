const headers = ['資格名', '社内ランク', '提供団体', '取得日', '期限日'];
const titleFactor = '資格名';

$(async () => {
    const response = await fetch('./data.json');
    const data = await response.json();
    const targets = $('meta[name="target"]').attr('content').split(',');

    const infoTable = $('#info-table').children('tbody');
    const infoList = $('#info-list');

    let index = 1;
    data.forEach((e, _) => {
        const type = e.filter(f => 'type' === f.type)[0].value;
        if (!targets.includes(type)) {
            return;
        }

        let expired = false;
        if (e.filter(f => '期限日' === f.label)[0]) {
            const expiredDate = e.filter(f => '期限日' === f.label)[0].value;
            const today = new Date().toLocaleDateString('sv-SE');
            if (today > expiredDate) {
                expired = true;
            }
        }

        const tr = $(`<tr data-target=${"id_" + index}><td>${index}</td></tr>`);
        if (expired) {
            tr.addClass('expired');
        }
        headers.forEach(f => {
            tr.append($(`<td>${e.filter(g => f === g.label)[0]?.value ?? '-'}</td>`));
        });
        infoTable.append(tr);

        infoList.append($(`<h2 id=${"id_" + index}>${e.filter(f => titleFactor === f.label)[0]?.value ?? '-'}</h2>`));
        const div = $('<div class="qualification-info"></div>')
        e.forEach(f => {
            if ('type' === f.type) {
                return;
            }
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
        infoList.append(div);
        index++;
    });

    // 一覧アイテム押下時のスクロール
    $('table.qualification-list > tbody > tr').each((_, e) => {
        let target = $(e).attr('data-target');
        if (target) {
            $(e).click(() => {
                $(window).scrollTop($(`#${target}`).position().top);
            });
        }
    });

    // データテーブル適用
    $('.qualification-list').DataTable({
        lengthChange: false,
        searching: true,
        ordering: true,
        info: false,
        paging: false
    });
});
