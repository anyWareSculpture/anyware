module.exports = {
  // http://eslint.org/docs/user-guide/configuring
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 2016,
    "sourceType": "module",
    "ecmaFeatures": {
      "impliedStrict": true,
    }
  },

  "env": {
    "shared-node-browser": true,
    "es6": true, // Necessary for ES global symbols like Set, Symbol
    "mocha": true, // adds all of the Mocha testing global variables.
  },

  "plugins": [
    "babel", // Adapts rules to better handle ES2016+ code
  ],

  "settings": {
  },

  "extends": [
    "eslint:recommended",
  ],

  // http://eslint.org/docs/rules/
  "rules": {

    // Possible errors
    "comma-dangle": ["error", "only-multiline"],
    "eqeqeq": ["error", "smart"],

    // Best practices
    "no-alert": "error",
    "no-unused-vars": "warn",
    "no-console": "warn",

    // ES2015
    "no-var": "error",

    // Style
    "indent": ["error", 2],
    "semi": ["error", "always"],
    "curly": ["error", "multi-line"],

    // Warn on FIXME/TODO comments
    "no-warning-comments": ["warn", { "location": "anywhere" }],
  }
};
