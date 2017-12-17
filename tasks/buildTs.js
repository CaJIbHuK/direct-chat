const gulp = require('gulp');
const ts = require('gulp-typescript');
const debug = require('gulp-debug');
module.exports = function ({src, dist}) {
  return gulp.src(src)
    .pipe(debug({title : 'scripts/make sources:'}))
    .pipe(ts.createProject('tsconfig.json')())
    .pipe(debug({title : 'scripts/make output:'}))
    .pipe(gulp.dest(dist));
};

