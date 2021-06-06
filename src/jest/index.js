module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // Prevent "jest-haste-map: Haste module naming collision" issue when package.json is copied into ./dist
    rootDir: './src',
    globals: {
        'ts-jest': {
            tsconfig: './tsconfig.json',
        },
    },
    collectCoverage: false,
    coverageReporters: ['text'],
    coverageThreshold: {
        global: {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
    },
    errorOnDeprecated: true,
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    verbose: false,
};
