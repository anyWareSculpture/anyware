var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

var isparta = require('isparta');

/**
 * Creates a testing task which runs tests and generates code coverage
 * @param gulp - The gulp module
 * @param {String|String[]} filesToCover - The glob or list of globs to cover in code coverage
 * @param {String|String[]} testFiles - The test files to run
 * @param {String} reporter - The reporter to use
 * @param {Number} minimumCodeCoverage - The minimum code coverage required
 * @param {String} [taskName='test'] - The name of the task
 */
module.exports = function(gulp, filesToCover, testFiles, reporter, minimumCodeCoverage, taskName='test') {
  gulp.task(taskName, function(callback) {
    require('babel/register');
    
    gulp.src(filesToCover)
    .pipe(istanbul({ instrumenter: isparta.Instrumenter }))
    .pipe(istanbul.hookRequire())
    .on('finish', function() {
      gulp.src(testFiles, {read: false})
        .pipe(mocha({
          reporter: reporter
        }))
        .pipe(istanbul.writeReports())
        .pipe(istanbul.enforceThresholds({
          thresholds: {
            global: minimumCodeCoverage
          }
        }))
        .on('error', function(error) {
          console.error("Code coverage is below " + minimumCodeCoverage + "%");
        })
        .on('end', callback);
    });
  });
};

