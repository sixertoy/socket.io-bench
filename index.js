/*global require, process, console, module */
(function () {

    'use strict';

    /** -------------------------------------------------


 Infos sur le process du benchmark


*/
    process.on('exit', function () {
        console.log('Benchmark exit as pid: ' + process.pid);
    });

    process.on('error', function (err) {
        console.log('Benchmark error as pid: ' + process.pid);
        console.log(err);
    });

    process.on('disconnect', function (err) {
        console.log('Benchmark disconnect as pid: ' + process.pid);
    });

    process.on('uncaughtException', function (err) {
        console.log('Benchmark uncaughtException as pid: ' + process.pid);
        console.log(err);
    });


    /** -------------------------------------------------

 Benchmark



*/
    var options, server, service, benchmark,
        FS = require('fs'),
        PKG = require('./package.json'),
        Commander = require('commander'),
        logger = require('./lib/smile/socketio_bench/logger'),
        Benchmark = require('./lib/smile/socketio_bench/benchmark');

    // recuperation des arguments
    // de la console
    Commander
        .version(PKG.version)
        .usage('[options] <server>')
        .option('-w, --worker <n>', 'Number of socket client, Default to 1', parseInt)
        .option('-a, --amount <n>', 'Persistents connections, Default to 100', parseInt)
        .option('-c, --concurency <n>', 'Concurents connections per second, Default to 20', parseInt)
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
            workers: Commander.worker || 1,
            amounts: Commander.amount || 100,
            messages: Commander.message || 0,
            concurrencies: Commander.concurency || 20
        };

        // affichage user friendly
        logger.head('Socket.io Benchmark v' + Commander.version());
        logger.info('Launch bench with ' + options.amounts + ' total connection, ' + options.concurrencies + ' concurent connection');
        // logger.info(program.message + ' message(s) send by client');
        logger.info(options.workers + ' worker(s)');

        // lancement du benchmark
        benchmark = new Benchmark(options, logger);
        benchmark.launch(server, service);

    }

}());
