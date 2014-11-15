/*global require, module, console, process */
(function () {
    'use strict';

    var Worker = require('./worker');

    var args = process.argv.slice(2),
        id = args[0],
        server = args[1],
        worker = new Worker(server, id);

    process.on('message', function (message, handle) {
        worker.close();
        process.send(message);
        process.exit();
    });

    process.on('SIGINT', function () {
        worker.close();
        process.send(JSON.stringify({action: 'cancel'}));
        process.exit();
    });

    worker.createConnections();

}());
