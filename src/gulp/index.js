const asciidoctor = require('./task/asciidoctor');
const clean = require('./task/clean');
const copy = require('./task/copy');
const packageJson = require('./task/package');
const typescript = require('./task/typescript');

exports.asciidoctor = asciidoctor;
exports.clean = clean;
exports.copy = copy;
exports.packageJson = packageJson;
exports.typescript = typescript;
