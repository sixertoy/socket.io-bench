/*global require, module, console, process */
(function () {
    'use strict';

    process.on('SIGINT', function () {
        process.send(JSON.stringify({
            action: 'cancel'
        }));
        process.exit(0);
    });

    var worker,
        lodash = require('lodash'),
        args = process.argv.slice(2), // index, server
        SocketClient = require('socket.io-client'),
        logger = require('./../../lib/smile/socketio_bench/logger');

    /** -----------------------------------------------
     *
     *
     * Worker class
     * for socket.io client
     *
     *
     */
    function Worker(server, id) {
        logger.debug('Process ' + process.pid + ' at work ');
        this.id = id;
        this.stop = null;
        this.start = null;
        this.client = null;
        this.server = server;
    }

    lodash.extend(Worker.prototype, {

        report: function (client, err) {
            this.stop = Date.now();
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
        }
    });

    Worker.prototype.createConnection = function (count) {
        this.start = Date.now();
        // no auto reconnect
        // @see http://socket.io/docs/client-api/
        var $this = this,
            client = SocketClient.connect(this.server, {
                reconnection: false
            });
        client.on('connect', function () {
            client.on('server.onconnection', function(data){
            })
            client.on('server.update', function(data){
            });
            //$this.report(this, null);
        });
        client.on('error', function (err) {
            // $this.report(this, err);
        });
        client.on('connect_error', function (err) {
            var data = {
                message: err.message,
                code: err.description
            };
            // $this.report(null, data);
        });
        this.client = client;
    };

    worker = new Worker(args[0], args[1]);
    worker.createConnection(args[2]);

}());
