module.exports = {
  "extends": "eslint:recommended",

  // http://eslint.org/docs/user-guide/configuring
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "modules": true
    }
  },

  "env": {
    "es6": true, // enable all ECMAScript 6 features except for modules.
    "shared-node-browser": true,
  },

  "plugins": [
    "babel"
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
  }
};
