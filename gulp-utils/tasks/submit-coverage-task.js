var codecov = require('gulp-codecov');

/**
 * Submits code coverage to codecov.io
 * This task will only work from a Travis CI like environment
 * @param gulp - the instance of the gulp module to use
 * @param {String} taskName - The name of the task to create
 * @param {String} [coverageFile='coverage/lcov.info'] - The path to the coverage file to submit
 */
module.exports = function(gulp, taskName, coverageFile) {
  coverageFile = coverageFile || 'coverage/lcov.info';
  gulp.task(taskName, function() {
    return gulp.src(coverageFile)
      .pipe(codecov());
  });
};
