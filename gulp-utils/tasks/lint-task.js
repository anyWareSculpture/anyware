var path = require('path');
var eslint = require('gulp-eslint');

/**
 * Creates a task for linting files
 */
module.exports = function(gulp, taskName, files) {
  var eslintrc = path.join(__dirname, '../../.eslintrc.js');

  gulp.task(taskName, function() {
    return gulp.src(files)
      .pipe(eslint(eslintrc))
      .pipe(eslint.format());
  });
};

