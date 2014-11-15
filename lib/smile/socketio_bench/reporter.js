/*global module, require, console */
(function(){

    var Table = require('cli-table');

    function Reporter(){
        this.table = new Table({
            head: ['PID', 'Message', 'Code', 'Time'],
            colWidth: [20, 100, 30, 30]
        });
    }

    Reporter.prototype.log = function(reports){
        // console.log(this.table.toString());
    };

    module.exports = Reporter;

}());
