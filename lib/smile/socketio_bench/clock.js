/*global require, module, console, Date */
(function(){


    function enforcer(){}

    function Clock(){
        this.ticks = [];
        this.stoppedAt = null;
        this.startedAt = null;
    }

    Clock.prototype.start = function(){
        this.ticks.push(Date.now());
        return this.ticks[0];
    };

    Clock.prototype.stop = function(){
        this.ticks.push(Date.now());
        return (this.ticks[(this.ticks.length - 1)] - this.startedAt);
    };

    Clock.prototype.tick = function(){
        this.ticks.push(Date.now());
        return (this.ticks[(this.ticks.length - 1)] - this.startedAt);
    };

    Clock.prototype.elapsed = function(){
        return (Date.now() - this.startedAt);
    };

    Clock.prototype.time = function(){
        return (this.stoppedAt - this.startedAt);
    };

    Clock.prototype.startedAt = function(){
        return this.ticks[0];
    };

    Clock.prototype.stoppedAt = function(){
        return this.ticks[(this.ticks.length - 1)];
    };

    module.exports = new Clock();

}());
