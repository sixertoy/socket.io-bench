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


    /** -------------------------------------------------


 Infos sur le process enfant


*/
    process.on('exit', function () {
        console.log('Client exit as pid: ' + process.pid);
    });

    process.on('error', function (err) {
        console.log('Client error as pid: ' + process.pid);
        console.log(err);
    });

    process.on('disconnect', function (err) {
        console.log('Client disconnect as pid: ' + process.pid);
    });

    process.on('uncaughtException', function (err) {
        console.log('Client uncaughtException as pid: ' + process.pid);
        console.log(err);
        var data = {
            type: 'kill',
            pid: process.pid
        };
        process.send(JSON.stringify(data));
    });

    var worker,
        lodash = require('lodash'),
        SocketClient = require('socket.io-client'),
        args = process.argv.slice(2), // index, server
        Clock = require('./../../lib/smile/socketio_bench/clock'),
        logger = require('./../../lib/smile/socketio_bench/logger');

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
    function Worker(server, connections, packets) {
        logger.debug('Process ' + process.pid + ' at work ');
        this.stacks = [];
        this.clients = [];
        this.server = server;
        this.packets = packets;
        this.clock = new Clock();
        this.connections = connections; // nb de connections par paquets
    }


    /** -----------------------------------------------


 Privates methods

*/
    lodash.extend(Worker.prototype, {

        /**
         *
         *
         */
        report: function (err, client) {
            if (err) {
                this.clients.push(null);
            } else {
                this.clients.push(client);
            }
            // si le nombre de clients ayant tente de se connecter au server
            // et sup ou egale au nombre de connections/packets
            if (this.clients.length >= this.connections) {
                // on arrete le calcul du temps
                var elapsed = this.clock.stop();
                // on stocke les connections
                this.stacks.push({
                    elapsed: this.clients
                });
                // on relance les connections
                // pour les packets
                this.createConnections();
            }
            /*
            var msg = (err ? 'error' : 'success'),
                message = JSON.stringify({
                    type: msg,
                    data: {
                        pid: process.pid,
                        code: (err ? err.code : 0),
                        message: (err ? err.message : 'OK'),
                        time: (this.stop - this.start)
                    }
                });
            if (client) {
                client.disconnect();
            }
            process.send(message);
            */
        }
    });

    Worker.prototype.createClient = function () {
        // @see http://socket.io/docs/client-api/
        console.log('createClient');
        var $this = this,
            opts = {
                'force new connection': true,
                'reconnection': false // no autoreconnect
            },
            client = SocketClient.connect(this.server, opts);
        // abonnement au event du serveur
        client.on('connect', function () {
            logger.debug('Client connected');
            $this.report(null, client);
            // recoit les datas existants en BDD
            // a la connection du client
            client.on('server.onconnection', function (data) {});
            // recoit les updates du server
            client.on('server.update', function (data) {});
        });
        // erreur du client
        client.on('error', function (err) {
            $this.report(err, null);
            logger.debug('Client error');
            logger.error(err);
        });
        // erreur de connection sur le server
        // server non lance
        client.on('connect_error', function (err) {
            logger.debug('Client connection error');
            logger.error(err);
            err = {
                message: err.message,
                code: err.description
            };
            $this.report(err, null);
        });
        // erreur de connection sur le server
        // server non lance
        client.on('connect_timeout', function (err) {
            logger.debug('Client connect timeout');
        });
        // erreur de connection sur le server
        // server non lance
        client.on('reconnecting', function (err) {
            logger.debug('Client reconnecting');
        });
        // erreur de connection sur le server
        // server non lance
        client.on('reconnect_error', function (err) {
            logger.debug('Client reconnect_error');
        });
        // erreur de connection sur le server
        // server non lance
        client.on('reconnect_error', function (err) {
            logger.debug('Client reconnect_failed');
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
        this.clients = [];
        console.log('createConnections');
        console.log(this.stacks.length + ' :: ' + this.packets);
        if (this.stacks.length < this.packets) {
            // si tous les client des paquets
            // n'ont pas tous ete crees
            this.clock.clear();
            this.clock.start();
            var i;
            for (i = 0; i < this.connections; i++) {
                this.createClient();
            }
        } else {
            // si tous les clients
            // des paquest ont ete crees
            console.log('envoi des reports');
            console.log(this.stacks);
            // send message
        }
    };

    // server, concurrencies, paquets
    worker = new Worker(args[0], args[1], args[2]);
    worker.createConnections();

    /*
        console.log('SIGINT');
        process.send(JSON.stringify({
            action: 'cancel'
        }));
        process.exit(0);
    });
    */

}());
