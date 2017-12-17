const gulp = require('gulp');
const gulpStyl = require('gulp-stylus');
const stylus = require('stylus');
const debug = require('gulp-debug');
module.exports = function ({src, dist}) {
  return gulp.src(src)
    .pipe(debug({title : 'css/make sources:'}))
    .pipe(gulpStyl({
      compress : true,
      rawDefine : {
        'inline-url' : stylus.url({limit : false})
      }
    }))
    .pipe(debug({title : 'css/make output:'}))
    .pipe(gulp.dest(dist));
};

