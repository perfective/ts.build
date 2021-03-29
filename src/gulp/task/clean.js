const del = require('del');

module.exports = function cleanTask(patterns, options) {
    return function clean() {
        return del(patterns, options);
    };
};
