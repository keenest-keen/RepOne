"use strict";

var global = require('./global'),
    exec = require('child_process').exec,
    app = global.app,
    fExec, // функция выполняет запрос и передаёт в коллбэк распарсенный объект, либо ошибку
    fRequestState, // функция запрашивает состояние подтверждения емейла и телефона
    fConfirm; // функция выполняет запрос на подтверждение емейла и телефона

fExec = function (execstr, callback) {
    exec(execstr, function (error, stdout, stderr) {
        console.log(execstr);
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);

        if (error !== null) {
            console.log('exec error: ' + error);
            callback({ error: error });
            return;
        }
        callback(JSON.parse(stdout));
    });
};

fRequestState = function (captcha, callback) {
    console.log('\nfRequestState()');
    fExec('curl https://publicverification.com/v4/captcha/' + captcha, function (obj) {
        if (obj.error) {
            console.log('remote server responded error: ' + obj.error.message );
            callback({ error: obj.error });
            return;
        }
        callback({
            result: 'ok',
            captcha: captcha,
            email: obj.data.message_data.email,
            phone: obj.data.message_data.phone
        });
    });
};

fConfirm = function (captcha, callback) {
    console.log('\nfConfirm()');
    fExec('curl -X POST https://publicverification.com/v4/code/' + captcha, function (obj) {
        if (obj.error || !obj.data || obj.data.message !== 'CODE_CONFIRMED') {
            console.log('remote server responded error: ' + obj.error.message );
            callback({ error: obj.error });
            return;
        }
        callback({ result: 'ok' });
    });
};

app.get('/sendrequest', function (req, res) {
    var phone = req.query.phone,
        email = req.query.email;

    fExec('curl -X POST -d \'{"token":"GOOD_TOKEN","email":"' + email + '","phone":"' + phone + '"}\' https://publicverification.com/v4/captcha/', function (obj) {
        console.log('\nBegin');
        var captcha;

        if (obj.error) {
            console.log('remote server answered error: ' + obj.error.message);
            res.json({ error: obj.error });
            return;
        }
        if (!(obj && obj.data && obj.data.message_data && obj.data.message_data.captcha_id)) {
            console.log('remote server responded invalid data');
            res.json({ error: 'remote server responded invalid data' });
            return;
        }

        captcha = obj.data.message_data.captcha_id;

        fRequestState(captcha, function (result) {
            if (result.error || (result.email && result.phone)) {
                res.json(result);
                return;
            }
            fConfirm(captcha, function () {});
            res.json(result);
        });
    });
});

app.get('/getstatus', function (req, res) {
    var captcha = req.query.captcha;

    fRequestState(captcha, function (result) {
        if (result.error || (result.email && result.phone)) {
            res.json(result);
            return;
        }
        fConfirm(captcha, function () {});
        res.json(result);
    });
});

app.use(function (req, res) {
    res.end('404');
});