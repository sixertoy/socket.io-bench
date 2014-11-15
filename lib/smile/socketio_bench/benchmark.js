/*global require, module, process, console */
(function () {

    'use strict';

    var Path = require('path'),
        Clock = require('./clock'),
        lodash = require('lodash'),
        CP = require('child_process'),
        defaults = {
            amounts: null,
            workers: null,
            messages: null,
            concurrencies: null
        },
        Benchmark = function (options) {
            Clock.start();
            this.workers = []; // ce sont les process
            this.server = null;
            this.options = defaults;
            lodash.assign(this.options, options);
        };

/**
     *
     * Private methods
     *
     */
    lodash.extend(Benchmark.prototype, {
        addWorkers: function (path, index) {
            var worker = CP.fork(path, [index, this.server]);
            worker.on('message', function (message, handle) {
                var message = JSON.parse(message);
                switch (message.type) {
                case 'complete':
                    console.log(message.data);
                    break;
                case 'error':
                    console.log(message.data);
                    break;
                case 'cancel':
                    console.log('User cancelled');
                    this.terminate();
                    process.exit();
                    break;
                }
            });
            worker.on('disconnect', function () {
                console.log('Child process disconnected');
            });
            worker.on('error', function (err) {
                console.log('Child process error with code :: ' + err.code);
            });
            worker.on('exit', function (code, signal) {
                console.log('Child process exited with code :: ' + code);
                console.log('Child process exited with signal :: ' + signal);
            });
            worker.on('close', function (code, signal) {
                console.log('Child process closed with code :: ' + code);
                console.log('Child process closed with signal :: ' + signal);
            });
            return worker;
        }
    });


    Benchmark.prototype.terminate = function(){
        Clock.stop();
        Clock.log();
    };

    /**
     *
     * Public methods
     *
     */
    Benchmark.prototype.launch = function (server, client) {
        this.server = server;
        this.client = Path.normalize(client);
        var i, child;
        for (i = 0; i < this.options.workers; i++) {
            child = this.addWorkers(this.client, i);
            this.workers.push(child);
        }
    };

    module.exports = Benchmark;

}());
