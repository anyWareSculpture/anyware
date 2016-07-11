var babel = require("gulp-babel");
var sourcemaps = require("gulp-sourcemaps");

/**
 * Creates a task for transpiling files
 * Sourcemaps are generated inline, in the file so they are always
 * available
 */
module.exports = function(gulp, taskName, targetFiles, destinationDirectory) {
  gulp.task(taskName, function() {
    return gulp.src(targetFiles)
      .pipe(sourcemaps.init())
      .pipe(babel({
        presets: ['es2015'],
        plugins: ['transform-class-properties']
      }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(destinationDirectory));
  });
};


