/*global require, module, process, console */
(function () {

    'use strict';

    var port,
        cTimeout = null, // timeout de chek bdd
        lTimeout = null, // timeout de users connected
        usersConnected = 0,
        usersPerSecond = 0,
        logger = require('./../lib/smile/socketio_bench/logger'),
        Sequelize = require('sequelize'),
        PKG = require('./package.json'),
        Commander = require('commander'),
        app = require('express')(),
        http = require('http').Server(app),
        io = require('socket.io')(http),
        sequelize = new Sequelize('socketio', 'root', ''),
        entity = require('./mockups/entity.json'),
        countEntries = 20; // nb d'entity envoyees a la connexion d'un user

    Commander
        .version(PKG.version)
        .usage('[options]')
        .option('-p, --port <n>', 'Listening port, default 3000', parseInt)
        .parse(process.argv);

    port = Commander.port || 3000;

    app.get('/', function (req, res) {
        res.send('<h1>Hello World</h1>');
    });

    /**
     * Renvoi le nombre de users connectes par secondes
     *
     */
    function logStatus() {
        logger.debug(usersConnected + ' users | ' + usersPerSecond + ' users/s');
        usersPerSecond = 0;
    }

    function launchWatch() {
        cTimeout = setTimeout(function () {
            var m = Math.round(Math.random() * 10);
            checkDatabase(m % 2);
        }, 2000);
    }

    function sendMessage(data, client) {
        if (client) {
            data = JSON.stringify(data);
            io.to(client.id).emit('server.onconnection', data);
        } else {
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
            if (!result.length) {
                launchWatch();
            } else {
                query = 'SELECT * FROM `picture`';
                sequelize.query(sql, null, opts).then(function (result) {
                    var data = JSON.stringify(entity);
                    sendMessage(data);
                    launchWatch();
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

            logger.debug('Client connection at ' + Date.now());

            // envoi les datas existant au client actuel
            var i,
                data = [],
                opts = {raw: true},
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
            if (cTimeout === null) {
                lTimeout = setInterval(logStatus, 1000);
                checkDatabase(0);
                logStatus();
            }

            // si un client se deconnecte
            // on verifie qu'il reste des clients
            client.on('disconnect', function () {
                logger.debug('On client disconnect');
                usersConnected--;
                if (usersConnected === 0) {
                    if (cTimeout) {
                        clearInterval(cTimeout);
                        cTimeout = null;
                    }
                    if (cTimeout) {
                        clearInterval(lTimeout);
                        lTimeout = null;
                    }
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
