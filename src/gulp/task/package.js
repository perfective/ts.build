const path = require('path');
const stream = require('stream');

const glob = require('glob');
const gulp = require('gulp');
const gulpJsonEditor = require('gulp-json-editor');

exports.packageJson = function packageJsonTask(options) {
    return async function packageJson() {
        options = packageJsonOptions(options);
        const packages = await subPackages(options.output);
        return gulp
            .src('./package.json')
            .pipe(
                gulpJsonEditor({
                    ...options,
                    scripts: undefined,
                    devDependencies: undefined,
                    main: options.main,
                    module: options.module,
                    types: options.types,
                    exports: {
                        '.': {
                            import: options.module,
                            require: options.main,
                        },
                        ...subPathExports(packages, options),
                    },
                }),
            )
            .pipe(gulp.dest('dist'));
    };
};

async function subPackages(output) {
    return new Promise((resolve, reject) => {
        glob(`${output}/*/package.json`, {}, (error, files) => {
            if (error) {
                reject(error);
            } else {
                resolve(files.map(subPackageName));
            }
        });
    });
}

/**
 * @see https://nodejs.org/api/packages.html#packages_subpath_exports
 */
function subPathExports(packages, options) {
    return packages
        .map(name => [
            `./${name}`,
            {
                import: options.module ? options.module.replace(/(?:\.\/)?index/u, `./${name}/index`) : undefined,
                require: options.main ? options.main.replace(/(?:\.\/)?index/u, `./${name}/index`) : undefined,
            },
        ])
        .reduce(
            (exports, [key, value]) => ({
                ...exports,
                [key]: value,
            }),
            {},
        );
}

exports.subPackageJson = function subPackageJsonTask(packageName, options) {
    return function subPackageJson() {
        options = packageJsonOptions(options);
        return gulp
            .src(`${options.output}/*/index.js`)
            .pipe(gulpSubPackageJson(packageName))
            .pipe(
                gulpJsonEditor({
                    ...options,
                    main: options.main,
                    module: options.module,
                    types: options.types,
                    exports: {
                        import: options.module,
                        require: options.main,
                    },
                    sideEffects: false,
                }),
            )
            .pipe(gulp.dest(options.output));
    };
};

function packageJsonOptions(options) {
    return {
        output: './dist',
        main: './index.cjs',
        module: './index.js',
        types: './index.d.ts',
        ...options,
    };
}

function gulpSubPackageJson(packageName) {
    const gulpStream = new stream.Transform({ objectMode: true });
    gulpStream._transform = (vinyl, encoding, callback) => {
        vinyl.path = subPackageJsonPath(vinyl.path);
        vinyl.contents = Buffer.from(
            JSON.stringify({
                name: `${packageName}/${subPackageName(vinyl.path)}`,
            }),
            encoding,
        );
        callback(null, vinyl);
    };
    return gulpStream;
}

function subPackageName(filepath) {
    return path.dirname(filepath).split('/').pop();
}

function subPackageJsonPath(originalPath) {
    return `${path.dirname(originalPath)}/package.json`;
}
