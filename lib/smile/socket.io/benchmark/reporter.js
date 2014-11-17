/*jslint plusplus: true */
/*global require, console, module */
(function () {

    'use strict';

    var colors = require('colors'),
        Table = require('cli-table');

    function Reporter() {}

    Reporter.prototype.log = function (stats) {
        var i, entry,
            table = new Table({
                head: [colors.red.bold('Elapsed', 'Clients')],
                colWidths: [20],
                colAligns: ['middle']
            });

        for (i = 0; i < stats.length; i++) {
            table.push([
                stats[i].elapsed
            ]);
        }
        console.log(table.toString());
    };

    module.exports = Reporter;

}());
