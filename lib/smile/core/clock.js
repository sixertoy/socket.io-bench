/*global require, module, console, Date */
(function () {

    'use strict';

    var lodash = require('lodash');

    function Clock() {
        this.ticks = [];
        this.stoppedAt = null;
        this.startedAt = null;
    }
    lodash.extend(Clock.prototype, {
        isRunning: function () {
            return (this.ticks.length > 0);
        },
        start: function () {
            this.stoppedAt = null;
            this.startedAt = Date.now();
            this.ticks.push(this.startedAt);
            return this.stoppedAt;
        },
        stop: function () {
            this.ticks = [];
            this.stoppedAt = Date.now();
            return (this.stoppedAt - this.startedAt);
        },
        tick: function () {
            this.ticks.push(Date.now());
            return (this.ticks[(this.ticks.length - 1)] - this.startedAt);
        },
        last: function () {
            return (this.ticks[(this.ticks.length - 1)] - this.startedAt);
        },
        elapsed: function () {
            return (Date.now() - this.startedAt);
        },
        clear: function () {
            this.ticks = [];
            this.stoppedAt = null;
            this.startedAt = null;
        },
        stopAndClear: function (seconds) {
            var time = this.stop();
            this.clear();
            if (seconds) {
                return (time / 1000);
            } else {
                return time;
            }
        }
    });

    module.exports = Clock;

}());
