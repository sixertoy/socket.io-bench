/*global require, module, process, console */
(function () {

    'use strict';

    var port,
        Commander = require('commander'),
        app = require('express')(),
        http = require('http').Server(app),
        io = require('socket.io')(http),
        PKG = require('./package.json');

    Commander
        .version(PKG.version)
        .usage('[options]')
        .option('-p, --port <n>', 'Listening port, default 3000', parseInt)
        .parse(process.argv);

    port = Commander.port || 3000;

    app.get('/', function (req, res) {
        res.send('<h1>Hello World</h1>');
    });

    http.listen(port, function () {
        console.log('Listening on port ' + port);
    });

    io.on('connection', function (client) {
        console.log('Client connection');
        client.on('disconnect', function () {
            console.log('On client disconnect');
        });
    });

}());
