module.exports = {
  ignorePatterns: ['node_modules', 'dist', 'cache', 'functions'],
  root: true,
  extends: [
    'airbnb',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:ava/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'ava'],
  rules: {
    // 'react-hooks/exhaustive-deps': 0,
    'no-shadow': 0,
    // 'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
    // 'no-console': 0,
    'import/prefer-default-export': 0,
    // 'import/no-default-export': 0,
    'import/extensions': [
      'error',
      {
        ts: 'never',
      },
    ],
    '@typescript-eslint/ban-ts-comment': 0,
    'import/no-unresolved': 0,
    camelcase: 0,
    'no-console': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    'no-use-before-define': 0,
    'import/no-extraneous-dependencies': 0,
    'no-restricted-syntax': 0,
    'guard-for-in': 0,
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: false,
      },
    ],
  },
  env: {
    node: true,
  },
}
