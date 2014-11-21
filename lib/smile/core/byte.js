(function () {

    'use strict';

    function Byte(val) {
        this.value = val;
    }

    Byte.prototype.toKilobytes = function () {
        return (this.value / 1024);
    };

    Byte.prototype.toMegabytes = function () {
        return (this.value / 1048576);
    };

    Byte.prototype.toGigabytes = function () {
        return (this.value / 1073741824);
    };

}());
