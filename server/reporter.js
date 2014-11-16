/*jslint plusplus: true */
/*global require, console, module */
(function () {

    'use strict';

    var colors = require('colors'),
        Table = require('cli-table');

    function Reporter() {
        this.table = new Table({
            head: [colors.red.bold('uptime'), colors.red.bold('conn. max'), colors.red.bold('conn. max/s'), colors.red.bold('msg')],
            colWidths: [10, 40, 6, 8],
            colAligns: ['middle', 'middle', 'middle', 'middle']
        });
    }

    Reporter.prototype.log = function (reports) {
        var i, entry;
        for (i = 0; i < reports.length; i++) {
            entry = [
                reports[i].pid,
                reports[i].message,
                reports[i].code,
                reports[i].time
            ];
            this.table.push(entry);
        }
        console.log(this.table.toString());
    };

    module.exports = Reporter;

}());
