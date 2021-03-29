module.exports = function babelPluginImportExtension(_babel) {
    return {
        visitor: {
            ImportDeclaration: esmModuleExtension,
            ExportDeclaration: esmModuleExtension,
        },
    };
};

function esmModuleExtension(path, state) {
    if (path.node.source !== null
        && isEsmModule(state.file.opts.filename)) {
        mjsExtension(path.node.source);
    }
}

const esmModuleFilenamePattern = /\.m?js$/u;

function isEsmModule(source) {
    return source.match(esmModuleFilenamePattern) !== null;
}

function mjsExtension(source) {
    if (isRelativePath(source.value)) {
        source.value += '.mjs';
    }
}

const relativePathPattern = /\.{1,2}\//u;
const extensionsPattern = /\.([cm]?)js$/u;

function isRelativePath(value) {
    return value.match(relativePathPattern)
        && !value.match(extensionsPattern);
}
