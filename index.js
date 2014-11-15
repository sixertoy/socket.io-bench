/*global require, module, process, console */
(function () {

    'use strict';

    var FS = require('fs'),
        Path = require('path'),
        Winston = require('winston'),
        PKG = require('./package.json'),
        Commander = require('commander'),
        Benchmark = require('./lib/smile/socketio_bench/benchmark');

    Commander
        .version(PKG.version)
        .usage('<conf>')
        .option('-c, --conf <s>', 'Config file')
        .parse(process.argv);

    console.log('Socket.io Benchmark v' + Commander.version());

    var conf = Path.normalize(__dirname + Path.sep + 'benchmark.json');
    if(Commander.config){
        conf = Path.normalize(Path.join(process.cwd(), Commander.config));
    }

    console.log(conf);

    /*
    var options = {
        workers: Commander.worker || 200,
        amounts: Commander.amount || 100,
        messages: Commander.message || 0,
        concurrencies: Commander.concurency || 20
    };

    var server = Commander.args[0],
        worker = './workers/socket.io';

    var bench = new Benchmark(options);
    bench.launch(server, worker);
    */


}());
