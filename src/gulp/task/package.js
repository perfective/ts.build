import path from 'node:path';
import stream from 'node:stream';

import { glob } from 'glob';
import gulp from 'gulp';
import gulpJsonEditor from 'gulp-json-editor';

export const packageJson = {
    packageJson: packageJsonTask,
    subPackageJson: subPackageJsonTask,
};

export function packageJsonTask(options, overrides, exports) {
    return async function packageJson() {
        options = packageJsonOptions(options);
        overrides = overrides ?? {};
        exports = exports ?? {};
        const packages = await subPackages(options.output);
        return gulp
            .src('./package.json')
            .pipe(
                gulpJsonEditor({
                    ...options,
                    // Remove "scripts" property from the package.json
                    scripts: undefined,
                    devDependencies: undefined,
                    main: options.main,
                    module: options.module,
                    types: options.types,
                    exports: {
                        '.': {
                            types: options.types,
                            import: options.module,
                            require: options.main,
                        },
                        ...subPathExports(packages, options),
                        // Manually set exports
                        ...exports,
                    },
                    // Remove options.output as a custom option
                    output: undefined,
                    // Manual overrides
                    ...overrides,
                }),
            )
            .pipe(
                gulpJsonEditor({
                    // Add "scripts" back to the package.json to avoid an NPM warning.
                    // In order for scripts to be empty, it has to be removed first.
                    // Otherwise, gulpJsonEditor uses deep merge and "scripts" property remains as is.
                    scripts: {},
                }),
            )
            .pipe(gulp.dest(options.output));
    };
}

async function subPackages(output) {
    return glob(`${output}/*/package.json`).then(files => files.map(subPackageName));
}

/**
 * @see https://nodejs.org/api/packages.html#packages_subpath_exports
 */
function subPathExports(packages, options) {
    return packages
        .map(name => [
            `./${name}`,
            {
                types: options.types ? options.types.replace(/(?:\.\/)?index/u, `./${name}/index`) : undefined,
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

export function subPackageJsonTask(packageName, options) {
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
                        '.': {
                            types: options.types,
                            import: options.module,
                            require: options.main,
                        },
                    },
                    sideEffects: false,
                    // Remove options.output as a custom option
                    output: undefined,
                }),
            )
            .pipe(gulp.dest(options.output));
    };
}

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
