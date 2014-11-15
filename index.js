#!/usr/bin/env node

/*global require, module, process, console */
(function () {

    'use strict';

    var FS = require('fs'),
        PKG = require('./package.json'),
        Commander = require('commander'),
        logger = require('./lib/smile/socketio_bench/logger'),
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
        concurencies: Commander.concurency || 20
    };

    var server = Commander.args[0],
        service = './workers/socket.io';

    logger.head('Socket.io Benchmark v' + Commander.version());
    logger.info('Launch bench with ' + options.amounts + ' total connection, ' + options.concurencies + ' concurent connection');
    // logger.info(program.message + ' message(s) send by client');
    logger.info(options.workers + ' worker(s)');

    var bench = new Benchmark(options, logger);
    bench.launch(server, service);

}());
