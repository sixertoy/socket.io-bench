/**
 *
 *
 *
 *
 *
 */
/*jslint plusplus: true */
/*global require, module, console, process */
(function () {

    'use strict';

    var worker,
        b = './../../',
        lodash = require('lodash'),
        args = process.argv.slice(2), // index, server
        SocketClient = require('socket.io-client'),
        Clock = require(b + 'lib/smile/core/clock'),
        logger = require(b + 'lib/smile/core/logger');

    /** -----------------------------------------------


 Constructeur

*/
    /**
     *
     * @params server Server URI
     * @params connections - connections/paquets
     * @params amounts - Nb de paquets
     *
     */
    function Worker(server, clients, packets) {
        logger.debug('Process ' + process.pid + ' at work ');
        this.ids = 0;
        this.stacks = [];
        this.clients = {};
        this.server = server;
        this.packets = packets;
        this.clock = new Clock();
        this.connections = clients; // nb de connections par paquets
    }


    /** -----------------------------------------------


 Privates methods

*/
    lodash.extend(Worker.prototype, {

        /**
         *
         *
         */
        report: function (err, id) {
            if (err) {
                this.clients[id] = null;
            } else {
                this.clients[id] = {
                    id: id,
                    messages: 0
                };
            }
            // si le nombre de clients ayant tente de se connecter au server
            // et sup ou egale au nombre de connections/packets
            if (lodash.size(this.clients) >= this.connections) {
                // on stocke les connections
                var pause = 500,
                    $this = this,
                    item = {
                        elapsed: this.clock.stop(),
                        reports: this.clients
                    };
                this.stacks.push(item);
                // on relance les connections
                // pour les packets
                setTimeout(function () {
                    $this.createConnections();
                }, pause);
            }
        }
    });

    Worker.prototype.createClient = function () {
        // @see http://socket.io/docs/client-api/
        this.ids++;
        var $this = this,
            opts = {
                'force new connection': true,
                'reconnection': false // no autoreconnect
            },
            client = SocketClient.connect(this.server, opts);
        client.customId = this.ids;
        // abonnement au event du serveur
        client.on('connect', function () {
            logger.debug('Client connected');
            $this.report(null, this.customId);
            // recoit les datas existants en BDD
            // a la connection du client
            client.on('server.onconnection', function (message) {
                logger.debug('OnConnection message received');
                $this.clients[this.customId].messages++;
            });
            // recoit les updates du server
            client.on('server.update', function (message) {
                logger.debug('Update message received');
                $this.clients[this.customId].messages++;
            });
        });
        // erreur du client
        client.on('error', function (err) {
            logger.debug('Client error');
            logger.error(err);
            logger.debug(err.stack);
            $this.report(err, this.customId);
        });
        // erreur de connection sur le server
        // server non lance
        client.on('connect_error', function (err) {
            logger.debug('Client connection error');
            logger.error(err);
            logger.debug(err.stack);
            $this.report(err, this.customId);
        });

    };


    /** -----------------------------------------------


 Public methods

*/
    /**
     *
     * Creation des clients socket.io
     *
     */
    Worker.prototype.createConnections = function () {
        // stocke les clients
        this.clients = {};
        var i, message;
        if (this.packets > this.stacks.length) {
            // si tous les client des paquets
            // n'ont pas tous ete crees
            this.clock.clear();
            this.clock.start();
            for (i = 0; i < this.connections; i++) {
                this.createClient();
            }
        } else {
            // si tous les clients
            // des paquest ont ete crees
            // on envoi un message au process parent
            message = JSON.stringify({
                type: 'success',
                pid: process.pid,
                data: this.stacks
            });
            logger.info('All packets are loaded');
            process.send(message);
        }
    };

    // server, concurrencies, paquets
    worker = new Worker(args[0], args[1], args[2]);
    worker.createConnections();


    /** -------------------------------------------------


 Infos sur le process enfant


*/
    process.on('exit', function () {
        console.log('Client exit as pid: ' + process.pid);
    });

    process.on('error', function (err) {
        console.log('Client error as pid: ' + process.pid);
        console.log(err);
        logger.debug(err.stack);
    });

    process.on('disconnect', function (err) {
        console.log('Client disconnect as pid: ' + process.pid);
    });

    process.on('uncaughtException', function (err) {
        console.log('Client uncaughtException as pid: ' + process.pid);
        console.log(err);
        logger.debug(err.stack);
        var data = {
            type: 'kill',
            pid: process.pid
        };
        process.send(JSON.stringify(data));
    });

    process.on('SIGINT', function (err) {
        var data = {
            type: 'cancel',
            pid: process.pid
        };
        process.send(JSON.stringify(data));
    });

}());
