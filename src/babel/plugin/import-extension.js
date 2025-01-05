export function babelPluginImportExtension(extension = 'mjs') {
    return function babelPluginImportExtension(_babel) {
        return {
            visitor: {
                ImportDeclaration: esModuleExtension(extension),
                ExportDeclaration: esModuleExtension(extension),
            },
        };
    };
}

function esModuleExtension(extension = 'mjs') {
    return function esmModuleExtension(path, state) {
        if (path.node.source === undefined) {
            // 'ExportDefaultDeclaration' node does not have `source` property.
            return;
        }
        if (path.node.source === null) {
            // 'ExportNamedDeclaration' node has `source` property set to `null`.
            return;
        }
        if (isEsmModule(state.file.opts.filename)) {
            mjsExtension(path.node.source, extension);
        }
    };
}

const esmModuleFilenamePattern = /\.m?js$/u;

function isEsmModule(source) {
    return source.match(esmModuleFilenamePattern) !== null;
}

function mjsExtension(source, extension = 'mjs') {
    if (isRelativePath(source.value)) {
        source.value += `.${extension}`;
    }
}

const relativePathPattern = /\.{1,2}\//u;
const extensionsPattern = /\.([cm]?)js$/u;

function isRelativePath(value) {
    return value.match(relativePathPattern) && !value.match(extensionsPattern);
}
