var path = require('path');

/**
 * Creates a task for linting files
 */
module.exports = function(gulp, taskName, files) {
  var eslintrc = path.join(__dirname, '../node_modules/@anyware/coding-style/.eslintrc');

  gulp.task(taskName, function() {
    return gulp.src(files)
      .pipe(eslint(eslintrc))
      .pipe(eslint.format())
      .pipe(eslint.failOnError());
  });
};

