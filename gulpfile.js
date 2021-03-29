const gulp = require('gulp');

const perfective = require('./src/gulp');

function source() {
    return perfective.copy('./src/**/*.js', './dist')();
}

function tsConfig() {
    return perfective.copy('./tsconfig/*.json', './dist')();
}

exports.clean = perfective.clean(['./dist']);
exports.documentation = perfective.asciidoctor();
exports.default = gulp.series(
    exports.clean,
    source,
    perfective.packageJson.subPackageJson('@perfective/build', {
        main: './index.js',
        module: undefined,
        types: undefined,
    }),
    perfective.packageJson.packageJson({
        main: './index.js',
        module: undefined,
        types: undefined,
    }),
    tsConfig,
    perfective.copy([
        './LICENSE*',
        './CHANGELOG*',
        './README*',
    ], './dist'),
    exports.documentation,
);
