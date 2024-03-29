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
    extends: [
        'eslint:recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
    ],
    overrides: [
        {
            files: ['*.test.ts', '*.test.js'],
            rules: {
                'handle-callback-err': 0,
                'no-loop-func': 0,
                'no-restricted-syntax': [
                    'error',
                    {
                        message: "Don't commit .only to tests!",
                        selector: 'MemberExpression > Identifier[name="only"]'
                    }
                ],
            },
        },
    ],
    rules: {
        'no-restricted-syntax': [
            'warn',
            {
                message: 'Don\'t use "export default". Prefer plain "export".',
                selector: 'ExportDefaultDeclaration'
            }
        ],
        'no-whitespace-before-property': 'error',
        'key-spacing': ['error', {
            beforeColon: false,
            afterColon: true,
            mode: 'strict'
        }],
        'padded-blocks': ['error', 'never'],
        'function-paren-newline': ['error', 'consistent'],
        'function-call-argument-newline': ['error', 'consistent'],
        'func-call-spacing': ['error', 'never'],
        'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
        'comma-style': ['error', 'last'],
        'space-in-parens': ['error', 'never'],
        'space-before-blocks': ['error', 'always'],
        'object-curly-spacing': ['error', 'always'],
        'keyword-spacing': ['error', { before: true, after: true }],
        'block-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never'],
        'array-element-newline': ['error', 'consistent'],
        'no-array-constructor': 'error',
        'chai-friendly/no-unused-expressions': [0, { allowShortCircuit: true }],
        'import/namespace': 2,
        'import/no-deprecated': 2,
        'require-yield': 0,
        'import/no-duplicates': 0,
        'import/no-unresolved': 0,
        'import/prefer-default-export': 0,
        'import/no-extraneous-dependencies': [
            0,
            {
                devDependencies: false,
                optionalDependencies: false,
                peerDependencies: false,
            },
        ],
        'import/newline-after-import': 1,
        indent: ['error', 4, { SwitchCase: 1 }],
        'no-useless-escape': 0,
        'no-dupe-class-members': 0,
        'no-buffer-constructor': 2,
        'comma-dangle': [0, 'always-multiline'],
        'no-var': 2,
        curly: 2,
        'eol-last': [1],
        quotes: 0,
        'new-cap': [0],
        'no-underscore-dangle': [0],
        'no-trailing-spaces': [1],
        semi: 0,
        'no-console': [0],
        'no-dupe-keys': [1],
        'handle-callback-err': 2,
        'valid-typeof': 2,
        'no-new-require': 1,
        'no-lonely-if': 'error',
        'prefer-arrow-callback': 1,
        'no-extra-parens': 0,
        'arrow-parens': 0,
        'arrow-body-style': 0,
        'object-shorthand': 1,
        'no-multiple-empty-lines': 1,
        'no-multi-spaces': 2,
        'prefer-template': 1,
        'callback-return': [
            'error',
            [
                'callback',
                'cb',
                'done',
                'res.send',
                'utils.badRequest',
                'utils.sendJsonResponse',
            ],
        ],
        'no-irregular-whitespace': 1,
        'no-else-return': 1,
        'no-empty': 2,
        'no-loop-func': 0,
        'no-mixed-requires': 1,
        'no-new': 2,
        'no-unused-expressions': 0,
        'no-use-before-define': 0,
        'valid-jsdoc': 0,
        'no-unused-vars': [0],
        'typescript/no-unused-vars': 0,
        'no-useless-return': 1,
        'quote-props': ['error', 'as-needed'],
        'brace-style': 'error',
        'mocha/handle-done-callback': 1,
        'mocha/no-global-tests': 1,
        'mocha/no-identical-title': 1,
        'prefer-const': 2,
        'no-useless-constructor': 0,
        'no-path-concat': 2,
        'no-useless-computed-key': 1,
        'prefer-destructuring': 0,
        'no-return-await': 2,
        'no-prototype-builtins': 1,
        'no-constant-condition': 0,
        '@typescript-eslint/no-redeclare': 2,
        'no-redeclare': 0,
        "no-magic-numbers": 0,
        '@typescript-eslint/comma-dangle': [2, 'always-multiline'],
        '@typescript-eslint/quotes': [2, 'single'],
        '@typescript-eslint/semi': 2,
        '@typescript-eslint/type-annotation-spacing': 2,
    },
    env: {
        es6: true,
        node: true,
        browser: true,
        mocha: true
    },
};
