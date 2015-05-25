var gulp = require('gulp');

var mocha = require('gulp-mocha');
var eslint = require('gulp-eslint');
var istanbul = require('gulp-istanbul');
var codecov = require('gulp-codecov.io');

var runSequence = require('run-sequence');
var isparta = require('isparta');

var gulpUtils = require('../gulp-utils');

MINIMUM_CODE_COVERAGE = 90;

gulp.task('default', function(callback) {
  return runSequence('lint', 'test', callback);
});

gulp.task('test', function test(callback) {
  require('babel/register');

  // files to cover
  gulp.src('src/**/*.js')
    .pipe(istanbul({ instrumenter: isparta.Instrumenter }))
    .pipe(istanbul.hookRequire())
    .on('finish', function() {
      gulp.src('test/**/*-test.js', {read: false})
        .pipe(mocha({
          reporter: process.env.TRAVIS ? 'spec' : 'nyan',
        }))
        .pipe(istanbul.writeReports())
        .pipe(istanbul.enforceThresholds({
          thresholds: {
            global: MINIMUM_CODE_COVERAGE
          }
        }))
        .on('error', function(error) {
          console.log("Code coverage is below " + MINIMUM_CODE_COVERAGE + "%");
        })
        .on('end', callback);
    });
});

/* This task will only work from a Travis like CI environment */
gulp.task('submit-coverage', function submitCoverage() {
  return gulp.src('coverage/lcov.info')
    .pipe(codecov());
});

gulp.task('lint', function lint() {
  return gulp.src(["src/**/*.js", "test/**/*.js"])
    .pipe(eslint('../.eslintrc'))
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

