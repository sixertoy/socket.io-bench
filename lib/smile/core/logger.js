/*global require, console, module */
(function () {

    'use strict';

    var Utils = require('util'),
        colors = require('colors'),
        lodash = require('lodash');

    function Logger() {
        this.modeDebug = false;
        this.trace = function (msg, level) {
            if (Utils.isError(msg)) {
                this.trace(msg.message, 'error');
                return false;
            }
            if (lodash.isPlainObject(msg)) {
                msg = Utils.inspect(msg, {
                    depth: 0,
                    colors: true,
                    showHidden: true
                });
            }
            var m;
            switch (level) {
            case 'log':
                m = colors.white(msg);
                break;
            case 'debug':
                m = colors.grey('DEBUG: ' + msg);
                break;
            case 'info':
                m = colors.green('INFO: ' + msg);
                break;
            case 'warn':
                m = colors.yellow('WARN: ' + msg);
                break;
            case 'error':
                m = colors.red.bold('ERROR: ' + msg);
                break;
            case 'fatal':
                m = colors.magenta('FATAL: ' + msg);
                break;
            case 'head':
                m = colors.green.bold(msg);
                break;
            case 'subhead':
                m = colors.grey.bold(msg);
                break;
            case 'ok':
                m = colors.green.bold('>> ') + colors.green(msg);
                break;
            case 'nok':
                m = colors.red.bold('>> ') + colors.red(msg);
                break;
            }
            console.log(m);
            return true;
        };
    }

    lodash.extend(Logger.prototype, {
        log: function (msg) {
            return this.trace(msg, 'log');
        },
        debug: function (msg) {
            if (this.modeDebug) {
                return this.trace(msg, 'debug');
            }
        },
        info: function (msg) {
            return this.trace(msg, 'info');
        },
        warn: function (msg) {
            return this.trace(msg, 'warn');
        },
        error: function (msg) {
            return this.trace(msg, 'error');
        },
        fatal: function (msg) {
            return this.trace(msg, 'fatal');
        },
        head: function (msg) {
            return this.trace(msg, 'head');
        },
        subhead: function (msg) {
            return this.trace(msg, 'subhead');
        },
        ok: function (msg) {
            return this.trace(msg, 'ok');
        },
        nok: function (msg) {
            return this.trace(msg, 'nok');
        }
    });

    Logger.prototype.debugMode = function (value) {
        this.modeDebug = value;
    };

    module.exports = new Logger();

}());
