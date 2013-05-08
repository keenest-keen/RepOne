"use strict";

var express = require('./lib/express'),
    app = express(),
    server,
    config = require('./config'),
    global = require('./global');

app.configure(function () {
    app.use(express.logger('Logger\t:status\t:method\t:url\t(:response-time ms)'));
    app.use(express.cookieParser());
    app.use(express.bodyParser());

    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));

    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));

    process.on('uncaughtException', function (err) {
        console.log('\n*** Process exception caught! ' + err + '\n');
    });
});

app.on('error', function (err) {
    console.log('\n*** Server error ' + err.message);
});

server = app.listen(config.PORT, config.IP, function (err) {
    global.app = app;
    require('./routes');
    console.log('Server started');
    console.log('Listening ' + config.IP + ':' + config.PORT);
    console.log('Node version: ' + process.version);
    console.log('Process id: ' + process.pid);
    if (err) {
        console.log('Error starting server: ' + err);
        process.exit(1);
    }
    setInterval(function () {
        console.log('    Memory usage, MB: ' + (process.memoryUsage().rss / (1024 * 1024)).toFixed(3));
    }, global.MEM_INTERVAL * 1000);
});