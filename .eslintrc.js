module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: [],
  globals: {
    __static: true
  },
  plugins: [
    'html'
  ],
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'indent': 0,
    'no-tabs': 'off',
    'space-before-function-paren': 0,
    'quotes': 'off',
    'semi': 'off',
    'no-new': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // "no-unused-vars": ["error", {
    //   "vars": "all",
    //   "args": "after-used",
    //   "ignoreRestSiblings": false
    // }]
  }
}