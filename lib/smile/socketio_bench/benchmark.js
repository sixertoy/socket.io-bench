/*jslint plusplus: true */
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
        };

    function Benchmark(options, logger) {
        this.clock = new Clock();
        this.errors = [];
        this.success = [];
        this.workers = []; // ce sont les process
        //
        this.server = null; // serveur du socket
        this.service = null; // quel socket js a tester
        this.timeout = null; // timer de watch
        this.logger = logger;
        this.options = defaults;
        lodash.assign(this.options, options);
    }

    /**
     *
     * Private methods
     *
     */
    lodash.extend(Benchmark.prototype, {

        watch: function () {
            if (this.clock.isRunning()) {
                var empty = (this.workers.length === 0);
                var equal = (this.errors.length === this.workers.length);
                if (!equal || empty) {
                    this.timeout = setTimeout(this.watch.bind(this), 500);
                } else {
                    this.terminate();
                }
            }
        },

        addWorkers: function (path, index) {
            // les workers sont des taches systemes
            // les process init le client socket
            var pid,
                $this = this,
                task = CP.fork(path, [this.server, index]);
            task.on('message', function (message, handle) {
                message = JSON.parse(message);
                switch (message.type) {
                case 'success':
                    $this.success.push(message.data);
                    $this.errors.push(null);
                    break;
                case 'error':
                    $this.success.push(null);
                    $this.errors.push(message.data);
                    break;
                case 'cancel':
                    $this.logger.warn('User cancelled');
                    $this.terminate();
                    break;
                }
            });
            task.on('disconnect', function () {
                $this.logger.debug('Child process disconnected');
            });
            task.on('error', function (err) {
                $this.logger.warn('Child process error with code :: ' + err.code);
            });
            task.on('exit', function (code, signal) {
                $this.logger.debug('Child process exited with code :: ' + code);
                $this.logger.debug('Child process exited with signal :: ' + signal);
            });
            task.on('close', function (code, signal) {
                $this.logger.debug('Child process closed with code :: ' + code);
                $this.logger.debug('Child process closed with signal :: ' + signal);
            });
            return task;
        }
    });


    Benchmark.prototype.terminate = function (pid) {
        if (this.clock.isRunning()) {
            var t = this.clock.stop();
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
            this.logger.ok('Benchmark done in ' + t + 'ms');
        }
    };

    /**
     *
     * Public methods
     *
     */
    Benchmark.prototype.launch = function (server, service) {
        this.clock.start();
        this.watch();
        this.server = server;
        this.service = Path.normalize(service);
        var i, task;
        for (i = 0; i < this.options.workers; i++) {
            task = this.addWorkers(this.service, i);
            this.workers.push(task);
        }
    };

    module.exports = Benchmark;

}());
