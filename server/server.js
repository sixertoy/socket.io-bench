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
        stats = {
            updateMsg: 0,
            maxConnected: 0,
            connectionMsg: 0,
            usersConnected: 0,
            usersPerSecond: 0,
            memoryUsage: process.memoryUsage()
        },
        usersPerSecond = 0,
        cTimeout = null, // timeout de chek bdd
        lTimeout = null, // timeout de users connected
        countEntries = 20, // pour multiplication gros messages
        // files
        pkg = require('./package.json'),
        entity = require('./mockups/entity.json'),
        // imports
        HTTP = require('http'),
        Utils = require('util'),
        Express = require('express'),
        SocketIO = require('socket.io'),
        Sequelize = require('sequelize'),
        Commander = require('commander'),
        Reporter = require('./reporter'),
        Clock = require('./../lib/smile/core/clock'),
        logger = require('./../lib/smile/core/logger'),
        // instance
        app = new Express(),
        http = HTTP.Server(app),
        io = new SocketIO(http),
        clock = new Clock(), // nb d'entity envoyees a la connexion d'un user
        reporter = new Reporter(),
        sequelize = new Sequelize('socketio', 'root', '');

    Commander
        .version(pkg.version)
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
        stats.maxConnected = (stats.usersConnected > stats.maxConnected ? stats.usersConnected : stats.maxConnected);
        logger.debug(stats.usersConnected + ' users | ' + usersPerSecond + ' users/s');
        if (usersPerSecond > stats.usersPerSecond) {
            stats.usersPerSecond = usersPerSecond;
        }
        usersPerSecond = 0;
        // memory usage
        var current = stats.process.memoryUsage();
        if (current.heapUsed > stats.memoryUsage.heapUsed) {
            stats.memoryUsage.heapUsed = current.heapUsed;
        }
        if (current.rss > stats.memoryUsage.rss) {
            stats.memoryUsage.rss = current.rss;
        }
        if (current.heapTotal > stats.memoryUsage.heapTotal) {
            stats.memoryUsage.heapTotal = current.heapTotal;
        }
    }

    function sendMessage(data, client) {
        if (client) {
            stats.connectionMsg++;
            data = JSON.stringify(data);
            io.to(client.id).emit('server.onconnection', data);
        } else {
            stats.updateMsg++;
            io.emit('server.update', data);
        }
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

    function launchWatch() {
        cTimeout = setInterval(function () {
            var m = Math.round(Math.random() * 10);
            checkDatabase(m % 2);
        }, 2000);
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
            stats.usersConnected++;

            logger.info(stats.usersConnected + ' users connected.');
            logger.debug('Client connection at ' + Date.now());

            // envoi les datas existant au client actuel
            var i,
                data = [],
                opts = {
                    raw: true
                },
                sql = 'SELECT * FROM `picture`';
            sequelize.query(sql, null, opts).then(function (result) {
                // envoi d'un gros paquet a la connection d'un user
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
                stats.usersConnected--;
                if (stats.usersConnected === 0) {
                    logger.info('No user connected');
                    if (cTimeout) {
                        clearInterval(cTimeout);
                        cTimeout = null;
                    }
                    if (cTimeout) {
                        clearInterval(lTimeout);
                        lTimeout = null;
                    }
                    stats.time = clock.stopAndClear(true);
                    var count = (stats.updateMsg + stats.connectionMsg);
                    logger.ok('Server has send ' + count + ' messages for ' + stats.maxConnected + ' connected users max');
                    logger.ok('Server was up during ' + stats.time + ' seconds.');
                    stats.updateMsg = 0;
                    stats.maxConnected = 0;
                    stats.connectionMsg = 0;
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
