/*global module, require, console */
(function () {

    var colors = require('colors'),
        Table = require('cli-table');

    function Reporter() {
        this.table = new Table({
            head: [colors.red.bold('PID'), colors.red.bold('Message'), colors.red.bold('Code'), colors.red.bold('ms')],
            colWidths: [10, 40, 6, 8],
            colAligns: ['middle', 'left', 'middle', 'middle']
        })
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
