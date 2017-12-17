const gulp = require('gulp');
const clean = require('gulp-clean');

module.exports = function (src) {
    return gulp.src(src, {read: false})
        .pipe(clean());
};