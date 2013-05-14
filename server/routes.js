"use strict";

var global = require('./global'),
    app = global.app,
    rest = global.restler;

app.get('/request_captcha', function (req, res) {
    var phone = req.query.phone,
        email = req.query.email;

    console.log('phone = ' + phone);
    console.log('email = ' + email);

    rest.post('https://publicverification.com/v4/captcha/', {
        data: {
            token: 'GOOD_TOKEN',
            email: email,
            phone: phone
        }
    }).on('complete', function (data) {
        console.log(data);
        res.json({ status: 'ok', captcha: data.data.message_data.captcha_id });
    });
});

app.get('/get_captcha_status', function (req, res) {
    var captcha = req.query.captcha;

    rest.get('https://publicverification.com/v4/captcha/' + captcha).on('complete', function (data) {
        console.log(data);
        if (data.data && data.data.message_data) {
            res.json({
                status: 'ok',
                email: data.data.message_data.email,
                phone: data.data.message_data.phone
            });
            return;
        }

        if (data.error && data.error.message) {
            res.json({ status: 'error', error: data.error.message });
            return;
        }

        res.json({ status: 'error', error: 'unknown error' });
    });
});

app.get('/confirm_code', function (req, res) {
    var code = req.query.code;

    rest.post('https://publicverification.com/v4/code/' + code, { data: {} }).on('complete', function (data) {
        console.log(data);
        res.json({ status: 'ok' });
    });
});

app.get('/resend', function (req, res) {
    var captcha = req.query.captcha,
        media = req.query.media;

    if ((media == 'sms') || (media == 'email')) {
        rest.get('https://publicverification.com/v4/captcha/' + captcha + '/' + media).on('complete', function (data) {
            console.log(data);
            if (data.error && data.error.message) {
                res.json({ status: 'error', error: data.error.message });
                return;
            }
            res.json({ status: 'ok' });
        });
    }
    else {
        res.json({ result: 'error', error: 'unknown media type' });
    }
});

app.use(function (req, res) {
    res.writeHead(404);
    res.end('404');
});