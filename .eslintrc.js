module.exports = {
  'env': {
    'es2021': true,
    'node': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  'ignorePatterns': [
    '**/dist/**',
    '**/worker/**',
  ],
  'rules': {
    'require-jsdoc': 'off',
    'max-len': 'warn',
    'no-tabs': 'warn',
  },
};
