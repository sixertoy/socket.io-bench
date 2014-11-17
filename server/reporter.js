/*jslint plusplus: true */
/*global require, console, module */
(function () {

    'use strict';

    var colors = require('colors'),
        Table = require('cli-table');

    function Reporter() {}

    Reporter.prototype.log = function (stats) {
        var output = new Table({
                head: [colors.red.bold('Uptime'), colors.red.bold('User(m/s)'), colors.red.bold('Msg (c/u)')],
                colWidths: [20, 20, 20],
                colAligns: ['middle', 'middle', 'middle']
            }),
            msg = (stats.connectionMsg + stats.updateMsg);
        output.push([
            stats.time,
            stats.maxConnected + colors.italic(' (' + stats.usersPerSecond + ')'),
            msg + colors.italic(' (' + stats.connectionMsg + '|' + stats.updateMsg + ')')
        ]);
        console.log(output.toString());
    };

    module.exports = Reporter;

}());
