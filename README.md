# anyware
The generic anyWare sculpture library for creating anyWare sculpture applications

## doc

This repository contains documentation.

* [CODING_STYLE.md](CODING_STYLE.md) - Describes the overall coding style to be used in all anyWare projects.
* [CODING_STANDARDS.md](CODING_STANDARDS.md) - Acts as a checklist to use for all code
* [.eslintrc](.eslintrc) - A configuration for [eslint](http://eslint.org) which enforces the coding style

## gulp-utils

Shared gulp utilities

## src

### streaming-client

### game-logic

This  models the game logic shared by all anyWare implementations.

When installed (or built), modules are stored in a `lib/` directory. Thus when requiring files, make sure that you are adding that before the path of the file you are requiring. In addition, ensure that you are requiring each individual file. `require('anyware/lib/game-logic')` alone will not work.

Example of correct usage:

    const MyThing = require('anyware/lib/game-logic/things/my-thing');

This was implemented this way for a variety of reasons:

1. Requiring individual files only gets those files and their dependencies. That way it isn't necessary to include the entire library if you only need a few parts.
2. This means that we don't have to keep any `index.js` or something up to date all the time. You can access whatever you want using the `lib/` directory.

### views

This contains shared views used by multiple anyWare runtimes.

Example of correct usage:

    const AudioView = require('anyware/lib/views/audio-view);

## Development

* Test: ```npm test```
* Build: ```npm run build```

### Publishing to NPM

Simply run ```./publish```

