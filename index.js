/*global GLOBAL, require, process, console, module */
(function () {

    'use strict';

    /** -------------------------------------------------

 Benchmark



*/
    var options, server, service, benchmark,
        FS = require('fs'),
        PKG = require('./package.json'),
        Commander = require('commander'),
        logger = require('./thirdparty/smile/core/logger'),
        Benchmark = require('./app/smile/socket.io/benchmark');

    // recuperation des arguments
    // de la console
    Commander
        .version(PKG.version)
        .usage('[options] <server>')
        .option('-w, --worker <n>', 'Number of socket client, Default to 1', parseInt)
        .option('-c, --clients <n>', 'Concurent clients/packets, Default to 20', parseInt)
        .option('-q, --query [value]', 'Client custom http query')
        .option('-p, --packets <n>', 'Number of packets of clients, Default to 5 (100 connections)', parseInt)
        .option('-d, --debug [value]', 'Debug mode')
        .parse(process.argv);

    if (!Commander.args.length) {
        // si aucun arguments pour la commande
        // affiche la desctiption de la commande
        Commander.help();

    } else {
        // si le param 'server' est renseigne
        server = Commander.args[0];
        service = './clients/socket.io';

        // definition des options du benchmark
        options = {
            query: Commander.query || '',
            workers: Commander.worker || 1,
            packets: Commander.packets || 5,
            messages: Commander.message || 0,
            clients: Commander.clients || 20
        };

        // affichage user friendly
        logger.debugMode(Commander.debug);
        logger.head('Socket.io Benchmark v' + Commander.version());
        logger.info('Launch bench with ' + options.clients + ' concurent clients/' + options.packets + ' packets.');
        logger.info((options.clients * options.packets) + ' Persistents connection will be etablished');
        // logger.info(program.message + ' message(s) send by client');
        logger.info(options.workers + ' worker(s)');

        // lancement du benchmark
        benchmark = new Benchmark(options, logger);
        benchmark.launch(server, service);

    }

    /** -------------------------------------------------


 Infos sur le process du benchmark


*/
    process.on('exit', function () {
        console.log('Benchmark exit as pid: ' + process.pid);
    });

    process.on('error', function (err) {
        console.log('Benchmark error as pid: ' + process.pid);
        console.log(err);
        logger.debug(err.stack);
    });

    process.on('disconnect', function (err) {
        console.log('Benchmark disconnect as pid: ' + process.pid);
    });

    process.on('uncaughtException', function (err) {
        console.log('Benchmark uncaughtException as pid: ' + process.pid);
        console.log(err);
        logger.debug(err.stack);
        process.exit(0);
    });

    process.on('SIGINT', function () {
        benchmark.terminate(process.pid);
        process.exit(0);
    });

}());
