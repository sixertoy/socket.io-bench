/*jslint plusplus: true */
/*global require, module, process, console */
(function () {

    'use strict';

    /** -------------------------------------------------


 Infos sur le process du benchmark


*/
    process.on('exit', function () {
        console.log('Benchmark exit as pid: ' + process.pid);
    });

    process.on('error', function (err) {
        console.log('Benchmark error as pid: ' + process.pid);
        console.log(err);
    });

    process.on('disconnect', function (err) {
        console.log('Benchmark disconnect as pid: ' + process.pid);
    });

    process.on('uncaughtException', function (err) {
        console.log('Benchmark uncaughtException as pid: ' + process.pid);
        console.log(err);
    });


    /** -------------------------------------------------

 Benchmark



*/

    var port,
        updateMsg = 0,
        maxConnected = 0,
        connectionMsg = 0,
        cTimeout = null, // timeout de chek bdd
        lTimeout = null, // timeout de users connected
        usersConnected = 0,
        usersPerSecond = 0,
        logger = require('./../lib/smile/core/logger'),
        Clock = require('./../lib/smile/core/clock'),
        Sequelize = require('sequelize'),
        PKG = require('./package.json'),
        Commander = require('commander'),
        app = require('express')(),
        http = require('http').Server(app),
        io = require('socket.io')(http),
        sequelize = new Sequelize('socketio', 'root', ''),
        entity = require('./mockups/entity.json'),
        countEntries = 20,
        clock = new Clock(); // nb d'entity envoyees a la connexion d'un user

    Commander
        .version(PKG.version)
        .usage('[options]')
        .option('-p, --port <n>', 'Listening port, default 3000', parseInt)
        .option('-d, --debug [value]', 'Debug mode')
        .parse(process.argv);

    port = Commander.port || 3000;
    logger.debugMode(Commander.debug);

    app.get('/', function (req, res) {
        res.send('<h1>Hello World</h1>');
    });

    /**
     * Renvoi le nombre de users connectes par secondes
     *
     */
    function logStatus() {
        maxConnected = (usersConnected > maxConnected ? usersConnected : maxConnected);
        logger.debug(usersConnected + ' users | ' + usersPerSecond + ' users/s');
        usersPerSecond = 0;
    }

    function sendMessage(data, client) {
        if (client) {
            connectionMsg++;
            data = JSON.stringify(data);
            io.to(client.id).emit('server.onconnection', data);
        } else {
            updateMsg++;
            io.emit('server.update', data);
        }
    }

    function launchWatch() {
        cTimeout = setInterval(function () {
            var m = Math.round(Math.random() * 10);
            checkDatabase(m % 2);
        }, 2000);
    }

    /**
     * Verification sur la BDD
     *
     */
    function checkDatabase(modulo) {
        var opts = {
                raw: true
            },
            query = 'SELECT * FROM `%%table%%`',
            table = (modulo ? 'watch' : 'empty'),
            sql = query.replace('%%table%%', table);

        logger.debug('checkDatabase :: ' + sql);

        // envoi de la requete
        sequelize.query(sql, null, opts).then(function (result) {
            if (result.length) {
                query = 'SELECT * FROM `picture`';
                sequelize.query(sql, null, opts).then(function (result) {
                    var data = JSON.stringify(entity);
                    sendMessage(data);
                }, function (err) {
                    logger.fatal(err);
                });
            }
        }, function (err) {
            // echec de la requete
            logger.fatal(err);
        });

    }

    /**
     * Si la connexion a la BDD
     * on lance l'ecoute du server
     *
     */
    function startServer() {

        http.listen(port, function () {
            logger.subhead('Listening on port ' + port);
        });

        io.on('connection', function (client) {
            usersPerSecond++;
            usersConnected++;

            logger.info(usersConnected + ' users connected.');
            logger.debug('Client connection at ' + Date.now());

            // envoi les datas existant au client actuel
            var i,
                data = [],
                opts = {
                    raw: true
                },
                sql = 'SELECT * FROM `picture`';
            sequelize.query(sql, null, opts).then(function (result) {
                for (i = 0; i < countEntries; i++) {
                    data.push(entity);
                }
                sendMessage(data, client);
            }, function (err) {
                logger.fatal(err);
            });

            // si un nouveau client se connecte
            // si le watch de la BDD n'est pas actif on lance le watch
            if (lTimeout === null) {
                lTimeout = setInterval(logStatus, 1000);
                launchWatch();
                logStatus();
                clock.start();
            }

            // si un client se deconnecte
            // on verifie qu'il reste des clients
            client.on('disconnect', function () {
                logger.debug('On client disconnect');
                usersConnected--;
                if (usersConnected === 0) {
                    logger.info('No user connected');
                    if (cTimeout) {
                        clearInterval(cTimeout);
                        cTimeout = null;
                    }
                    if (cTimeout) {
                        clearInterval(lTimeout);
                        lTimeout = null;
                    }
                    var time = clock.stopAndClear(true);
                    var count = (updateMsg + connectionMsg);
                    logger.ok('Server has send ' + count + ' messages (' + connectionMsg + '/' + updateMsg + ') for ' + maxConnected + ' connected users max');
                    logger.ok('Server was up during ' + time + ' seconds.');
                    updateMsg = 0;
                    maxConnected = 0;
                    connectionMsg = 0;
                }
            });
        });

    }

    sequelize.authenticate().then(function () {
        // connexion a la bdd
        // demarrage du server
        startServer();
    }, function (err) {
        // echec de connexion a mysql
        logger.fatal(err);
    });

}());
