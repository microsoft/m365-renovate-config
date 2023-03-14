module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // overrides
    'no-unused-vars': ['error', { ignoreRestSiblings: true }],

    // important
    'no-shadow': 'error',

    // possible errors
    eqeqeq: 'error',
    'no-constant-binary-expression': 'error',
    'no-duplicate-imports': 'error',
    'no-return-assign': 'error',
    'no-sequences': 'error',

    // preference/style
    'no-else-return': 'error',
    'no-return-await': 'error',
    'no-var': 'error',
    'require-await': 'error',
    'spaced-comment': ['error', 'always'],

    // not needed with typescript checking, copied from https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslint-recommended.ts
    // (this repo currently doesn't use typescript-eslint)
    'constructor-super': 'off', // ts(2335) & ts(2377)
    'getter-return': 'off', // ts(2378)
    'no-const-assign': 'off', // ts(2588)
    'no-dupe-args': 'off', // ts(2300)
    'no-dupe-class-members': 'off', // ts(2393) & ts(2300)
    'no-dupe-keys': 'off', // ts(1117)
    'no-func-assign': 'off', // ts(2539)
    'no-import-assign': 'off', // ts(2539) & ts(2540)
    'no-new-symbol': 'off', // ts(7009)
    'no-obj-calls': 'off', // ts(2349)
    'no-redeclare': 'off', // ts(2451)
    'no-setter-return': 'off', // ts(2408)
    'no-this-before-super': 'off', // ts(2376)
    'no-undef': 'off', // ts(2304)
    'no-unreachable': 'off', // ts(7027)
    'no-unsafe-negation': 'off', // ts(2365) & ts(2360) & ts(2358)
    'valid-typeof': 'off', // ts(2367)
  },
};
