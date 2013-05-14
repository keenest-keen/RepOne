var global = {
    express: require('./lib/express'),
    restler: require('./lib/restler'),

    MEM_INTERVAL: 30    // интервал (в секундах) вывода занимаемой процессом памяти
};

module.exports = global;