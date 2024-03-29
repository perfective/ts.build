const gulp = require('gulp');
const gulpBabel = require('gulp-babel');
const gulpRename = require('gulp-rename');
const gulpTypeScript = require('gulp-typescript');

exports.esmBuild = function esmBuildTask(options = {}) {
    return function esmBuild() {
        options = typeScriptOptions(options);
        return typeScriptConfig(options.config, {
            module: 'esnext',
            allowSyntheticDefaultImports: true,
        })
            .pipe(gulpBabel())
            .pipe(gulp.dest(options.output));
    };
};

exports.cjsBuild = function cjsBuildTask(options = {}) {
    return function cjsBuild() {
        options = typeScriptOptions(options);
        return typeScriptConfig(options.config, {
            module: 'commonjs',
            esModuleInterop: true,
        })
            .pipe(gulpBabel())
            .pipe(gulpRename(fileExtension('js', 'cjs')))
            .pipe(gulp.dest(options.output));
    };
};

exports.tsDeclarations = function tsDeclarationsTask(options = {}) {
    return function tsDeclarations() {
        options = typeScriptOptions(options);
        return typeScriptConfig(options.config, {
            module: 'esnext',
            removeComments: false,
            emitDeclarationOnly: true,
            declaration: true,
        }).pipe(gulp.dest(options.output));
    };
};

exports.tsBuild = function tsBuildTask(options = {}) {
    return function tsBuild() {
        options = typeScriptOptions(options);
        return typeScriptConfig(options.config).pipe(gulp.dest(options.output));
    };
};

function typeScriptConfig(config, settings = {}) {
    const project = gulpTypeScript.createProject(config, settings);
    return project.src().pipe(project());
}

function typeScriptOptions(options) {
    return {
        config: './tsconfig.build.json',
        output: './dist',
        ...options,
    };
}

function fileExtension(from, to) {
    return path => {
        if (path.extname === `.${from}`) {
            path.extname = `.${to}`;
        }
    };
}
