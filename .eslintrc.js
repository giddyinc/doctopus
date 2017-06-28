module.exports = {
  "extends": "xo-space",
  "env": {
    "mocha": true
  },
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
    },
    "sourceType": "module"
  },
  "rules": {
    'prefer-arrow-callback': 1,
    'no-extra-parens': 1,
    'arrow-parens': [1, "as-needed"],
    'arrow-body-style': ["error", "as-needed"],
    "guard-for-in": [0],
    "max-nested-callbacks": 0,
    "no-multiple-empty-lines": 1,
    "no-var": 1,
    "prefer-const": 1
  }
}
