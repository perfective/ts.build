import gulp from 'gulp';
import * as perfective from './src/gulp/index.js';

function source() {
    return perfective.copy('./src/**/*.js', './dist')();
}

function tsConfig() {
    return perfective.copy('./tsconfig/*.json', './dist')();
}

export const clean = perfective.clean(['./dist']);
export const documentation = perfective.asciidoctor();

export default gulp.series(
    clean,
    source,
    perfective.packageJson.subPackageJson('@perfective/build', {
        type: 'module',
        // For NodeJs (https://nodejs.org/api/packages.html#main)
        main: './index.js',
        // For bundlers (see https://esbuild.github.io/api/#main-fields)
        module: './index.js',
        types: undefined,
    }),
    perfective.packageJson.packageJson(
        {
            main: './index.js',
            module: './index.js',
            types: undefined,
        },
        {},
        {
            './tsconfig.strict.json': {
                require: './tsconfig.strict.json',
            },
        },
    ),
    tsConfig,
    perfective.copy(['./LICENSE*', './CHANGELOG*', './README*'], './dist'),
    documentation,
);
