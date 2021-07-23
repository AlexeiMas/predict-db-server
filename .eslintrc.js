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
        code: 120,
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
    'no-plusplus': [
      2,
      {
        allowForLoopAfterthoughts: true,
      },
    ],
  },
};
