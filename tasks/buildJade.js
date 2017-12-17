const gulp = require('gulp');
const jade = require('gulp-jade');
const debug = require('gulp-debug');

module.exports = function ({src, dist}) {
  return gulp.src(src)
    .pipe(debug({title : 'templates/make sources:'}))
    .pipe(jade({
      pretty: true
    }))
    .pipe(debug({title : 'templates/make output:'}))
    .pipe(gulp.dest(dist));
};