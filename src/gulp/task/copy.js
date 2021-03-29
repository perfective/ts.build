const gulp = require('gulp');

module.exports = function copyTask(source, destination) {
    return function copy() {
        return gulp
            .src(source)
            .pipe(gulp.dest(destination));
    };
};
