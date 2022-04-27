module.exports = {
  ignorePatterns: ['node_modules', 'dist', 'cache'],
  root: true,
  extends: [
    'airbnb',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
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
  },
  env: {
    node: true,
  },
}
