import antfu, { imports, node } from '@antfu/eslint-config';

export default antfu(
    {
        type: 'app',
        stylistic: {
            indent: 4,
            quotes: 'single',
            semi: true,
            braceStyle: '1tbs',
        },
        markdown: false,
        html: true,
        css: true,
        typescript: true,
        ignores: [
            '.github/**',
            '.idea/**',
            '.vscode/**',
            '.wrangler/**',
            'build/**',
            'node_modules/**',
        ],
    },
    imports,
    node,
    {
        rules: {
            'eslint-comments/no-unlimited-disable': 'off',
            'padding-line-between-statements': 'off',
            'no-console': 'off',
            'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
        },
    },
);
