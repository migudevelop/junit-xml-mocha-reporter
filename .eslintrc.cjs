/**
 * @typedef {import('eslint').Linter.Config} ESLintConfig
 */
module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  ignorePatterns: ['/dist/**/*', '/node_modules/**/*', '/test/**/*'],
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:prettier/recommended'
  ],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'import/order': [
      2,
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ],
    'prefer-const': [
      'warn',
      {
        destructuring: 'all'
      }
    ]
  }
}
