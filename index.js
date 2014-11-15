/*global require, module, process, console */
(function () {

    'use strict';

    var FS = require('fs'),
        PKG = require('./package.json'),
        Commander = require('commander'),
        Logger = require('./lib/smile/socketio_bench/logger'),
        Benchmark = require('./lib/smile/socketio_bench/benchmark');

    Commander
        .version(PKG.version)
        .usage('[options] <server>')
        .option('-w, --worker <n>', 'Number of socket client, Default to 1', parseInt)
        .option('-a, --amount <n>', 'Persistents connections, Default to 100', parseInt)
        .option('-c, --concurency <n>', 'Concurents connections per second, Default to 20', parseInt)
        .parse(process.argv);

    if (!Commander.args.length) {
        Commander.help();
    }

    var options = {
        workers: Commander.worker || 1,
        amounts: Commander.amount || 100,
        messages: Commander.message || 0,
        concurrencies: Commander.concurency || 20
    };

    var server = Commander.args[0],
        service = './workers/socket.io';

    Logger.head('Socket.io Benchmark v' + Commander.version());
    var bench = new Benchmark(options, Logger);
    bench.launch(server, service);

}());
