/*global module, require, console */
(function () {

    var colors = require('colors'),
        Table = require('cli-table');

    function Reporter() {
        this.heads = new Table({
            head: [colors.red.bold('PID'), colors.red.bold('Message'), colors.red.bold('Code'), colors.red.bold('Time')],
            colWidths: [10, 40, 6, 7],
            colAligns: ['middle', 'left', 'middle', 'middle'],
            chars: {
                'top': '═',
                'top-mid': '╤',
                'top-left': '╔',
                'top-right': '╗',
                'bottom': '═',
                'bottom-mid': '╧',
                'bottom-left': '╚',
                'bottom-right': '╝',
                'left': '║',
                'left-mid': '╟',
                'mid': '─',
                'mid-mid': '┼',
                'right': '║',
                'right-mid': '╢',
                'middle': '│'
            }
        });
        this.results = new Table({
            head: [],
            colWidths: [10, 40, 6, 7],
            colAligns: ['middle', 'left', 'middle', 'middle']
        });
    }

    Reporter.prototype.log = function (reports) {
        var i, entry;
        console.log(this.heads.toString());
        for (i = 0; i < reports.length; i++) {
            entry = [
                reports[i].pid,
                reports[i].message,
                reports[i].code,
                reports[i].time
            ];
            this.results.push(entry);
        }
        console.log(this.results.toString());
    };

    module.exports = Reporter;

}());
