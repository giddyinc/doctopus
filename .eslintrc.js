'use strict';

module.exports = {
    parser: '@typescript-eslint/parser',
    settings: {
        cache: true,
        cacheLocation: '.vscode/.eslintcache',
        'import/extensions': ['.js'],
        'import/resolver': {
            typescript: {},
            node: {
                extensions: ['.js', '.json', '.ts'],
            },
        },
    },
    parserOptions: {
        ecmaVersion: 9,
        sourceType: 'module',
        experimentalObjectRestSpread: true,
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
    },
    extends: ['@boxed/eslint-config-style-guide/nodejs'],
    globals: {
        NodeJS: true,
        Highland: true,
    },
    plugins: [
        '@typescript-eslint',
        'typescript',
        'chai-friendly',
        'promise',
        'mocha',
    ],
    overrides: [],
    rules: {},
};
