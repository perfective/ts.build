const gulpAsciidoctor = require('@asciidoctor/gulp-asciidoctor');

const gulp = require('gulp');
const gulpRename = require('gulp-rename');

module.exports = function asciidoctorTask(options = {}) {
    return function documentation() {
        options = asciidoctorOptions(options);
        return gulp.src(options.source)
            .pipe(gulpAsciidoctor())
            .pipe(gulpRename(path => {
                path.basename = options.name;
                return path;
            }))
            .pipe(gulp.dest(options.output));
    };
};

function asciidoctorOptions(options) {
    return {
        source: './src/index.adoc',
        output: './dist',
        name: 'docs',
        ...options,
    };
}
