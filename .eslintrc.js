/* cSpell:disable */
module.exports = {
  plugins: [
    'import',
  ],
  extends: [
    'airbnb-base',
  ],
  rules: {
    'max-len': [
      2,
      {
        code: 150,
        ignoreUrls: true,
        ignoreRegExpLiterals: true,
      },
    ],
    radix: [
      2,
      'as-needed',
    ],
    'no-unused-vars': [
      2,
      {
        args: 'none',
        ignoreRestSiblings: true,
      },
    ],
    'no-underscore-dangle': 'off',
    'no-plusplus': [
      2,
      {
        allowForLoopAfterthoughts: true,
      },
    ],
  },
};
