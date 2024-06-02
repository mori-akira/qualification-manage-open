const PASS = 'b03ddf3ca2e714a6548e7495e2a03f5e824eaac9837cd7f159c67b90fb4b7342';

$(async () => {
    const pass = $('#password');
    const msg = $('#passMessage');
    msg.hide();
    const btn = $('#openButton');

    pass.focus(() => {
        pass.removeClass('error');
        msg.hide();
    });

    pass.on('input', () => {
        pass.removeClass('error');
        msg.hide();
        if (pass.val().length > 0) {
            btn.attr('disabled', false);
        } else {
            btn.attr('disabled', true);
        }
    });

    pass.on('keydown', e => {
        if (e.key === 'Enter') {
            btn.trigger('click');
        }
    });

    btn.click(async () => {
        if (btn.attr('disabled') == true) {
            return;
        }
        if (await sha256(pass.val()) === PASS) {
            const match = location.search.match(/\?target=(.+)/);
            if (!match || match.length < 2) {
                location.assign('/index.html');
            }
            try {
                const target = atob(match[1]);
                location.assign(target);
            } catch (ex) {
                location.assign('/index.html');
            }
        } else {
            pass.addClass('error');
            pass.val('');
            msg.show();
            btn.attr('disabled', true);
        }
    });
});

async function sha256(text) {
    const uint8 = new TextEncoder().encode(text)
    const digest = await crypto.subtle.digest('SHA-256', uint8)
    return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2, '0')).join('')
}
