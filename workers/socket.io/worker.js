/*global require, module, console, process */
(function () {
    'use strict';

    var lodash = require('lodash'),
        SocketClient = require('socket.io-client');

    function Worker(server, id) {
        console.log('Process id ' + id + ' at work ');
        this.id = id;
        // this.errors = [];
        // this.count = null;
        // this.clients = [];
        // this.running = false;
        // this.timeout = null;
        this.server = server;
    }

    lodash.extend(Worker.prototype, {

        report: function (err) {
            var msg = (err ? 'error' : 'complete');
            var message = JSON.stringify({
                type: msg,
                data: err
            });
            process.send(message);
        },

        /*
        watch: function () {
            if (this.running) {
                var loaded = this.clients.length === this.count;
                if (!loaded || lodash.isNull(this.count)) {
                    this.timeout = setTimeout(this.watch.bind(this), 500);
                } else {
                    this.close();
                    this.report();
                }
            }
        },
        */

        create: function (opts) {
            this.count = count;
            // no auto reconnect
            // @see http://socket.io/docs/client-api/
            var $this = this,
                client = SocketClient.connect(this.server, opts);
            client.on('connect', function () {
                $this.report(null);
            });
            client.on('error', function (err) {
                $this.report(err);
            });
            client.on('connect_error', function (err) {
                var data = {
                    code: err.description,
                    message: err.message
                };
                $this.report(data);
            });
            client.on('reconnect_attempt', function (err) {
                console.log('SocketIO client reconnect_attempt');
            });
            return client;
        }

    });

    /*
    Worker.prototype.close = function () {
        if (this.running) {
            this.running = false;
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    };
    */

    Worker.prototype.createConnections = function () {
        // this.running = false;
        // this.watch();
        this.create({
            reconnection: false
        });
    };

    module.exports = Worker;

}());
