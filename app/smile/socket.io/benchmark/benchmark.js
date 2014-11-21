/*jslint plusplus: true */
/*global require, include, module, process */
(function () {

    'use strict';

    var defaults,
        Path = require('path'),
        lodash = require('lodash'),
        CP = require('child_process'),
        Reporter = require('./reporter'),
        Clock = include('lib/smile/core/clock');

    // definition des valeurs
    // par defaut du module
    defaults = {
        packets: null,
        workers: null,
        messages: null,
        clients: null
    };

    /** ---------------------------------------------------------------------------


Constructeur


*/
    /**
     * @params options [object] Options de la ligne de commande
     * @params logger [Logger] Debugger
     */
    function Benchmark(options, logger) {
        this.tasks = []; // workers, process enfants
        this.reports = [];
        this.server = null; // serveur du socket
        this.service = null; // socket js a tester
        this.logger = logger;
        this.packets = options.packets; // nb de paquets
        this.reporter = new Reporter();
        // merge des options par defaut
        // avec celles de la consle
        this.options = defaults;
        lodash.assign(this.options, options);
    }


    /** ---------------------------------------------------------------------------


Privates methods


*/
    lodash.extend(Benchmark.prototype, {

        /**
         *
         */
        watch: function () {},

        /**
         * Ajout une tache
         * pour le lancement des tests
         *
         * @params path [string] uri du module js a executer en tache
         * @params server [string] uri du server socket.io
         * @params concurrencies [int] nb de connexions clients
         * @params packets [int] nb du paquets de clients
         */
        createWorker: function (path, server, clients, packets) {
            // les workers sont des taches systemes
            // les process init le client socket
            var pid,
                $this = this,
                index = this.tasks.length,
                task = CP.fork(path, [server, clients, packets]);
            // message recu par l'instance client
            task.on('message', function (message, handle) {
                message = JSON.parse(message);
                switch (message.type) {
                case 'success':
                    $this.reports = message.data;
                    $this.terminate(message.pid);
                    break;
                case 'cancel':
                    $this.logger.warn('User cancelled');
                    $this.terminate(message.pid);
                    break;
                case 'kill':
                    process.kill(message.pid);
                    break;
                }
            });

            /**
             *
             * Events sur les process enfants
             *
             */
            task.on('disconnect', function () {
                $this.logger.debug('Task ' + task.pid + ' disconnected as worker: ' + index);
            });
            task.on('error', function (err) {
                $this.logger.debug('Task ' + task.pid + ' error as worker: ' + index);
                $this.logger.error(err);
            });
            task.on('exit', function (code, signal) {
                $this.logger.debug('Task ' + task.pid + ' exit :: code: ' + code + ' | signal: ' + signal + ' as worker: ' + index);
            });
            task.on('close', function (code, signal) {
                $this.logger.debug('Task ' + task.pid + ' close :: code: ' + code + ' | signal: ' + signal + ' as worker: ' + index);
            });
            task.on('uncaughtException', function (err) {
                $this.logger.debug('Task ' + task.pid + ' uncaughtException as worker: ' + index);
                $this.logger.fatal(err);
            });
            return task;
        }

    });


    /** ---------------------------------------------------------------------------


Public methods


*/
    Benchmark.prototype.terminate = function (pid) {
        this.reporter.log(this.reports);
        process.kill(pid);
    };

    /**
     *
     * Creation des process enfants (multi instance node)
     *
     */
    Benchmark.prototype.launch = function (server, service) {
        this.server = server;
        this.service = Path.normalize(service);
        var i, task;
        for (i = 0; i < this.options.workers; i++) {
            // path, index, server, concurrencies, packets
            task = this.createWorker(this.service, this.server, this.options.clients, this.packets);
            this.tasks.push(task);
        }
    };

    module.exports = Benchmark;

}());
