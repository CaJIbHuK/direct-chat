const gulp = require('gulp');
const ts = require('gulp-typescript');
const stylus = require('gulp-stylus');
const webserver = require('gulp-webserver');
const merge = require('merge-stream');
const tasks = require('./tasks');

let env = process.env;

let buildTsTask = tasks.buildTs;
let buildStylTask = tasks.buildStyl;
let buildJadeTask = tasks.buildJade;
let cleanTask = tasks.clean;
let serverTask = tasks.server;

const buildTsSrc = 'src/**/*.ts';
const buildStylSrc = 'src/**/*.styl';
const buildIndexHtmlSrc = 'src/templates/index.jade';

const dist = 'dist';
const port = env.PORT || 8000;

process.on('uncaughtException', function(err) {
  console.error(err.message, err.stack, err.errors);
  process.exit(255);
});

gulp.task('clean', cleanTask.bind(null, dist));

gulp.task('ts', ['clean'], buildTsTask.bind(null, {src : buildTsSrc, dist : dist}));
gulp.task('stylus', ['clean'], buildStylTask.bind(null, {src : buildStylSrc, dist : dist}));
gulp.task('jade', ['clean'], buildJadeTask.bind(null, {src : buildIndexHtmlSrc, dist : dist}));

gulp.task('server', serverTask.bind(null, dist, port));

gulp.task('buildAndStart', ['ts', 'stylus', 'jade', 'vendor'], serverTask.bind(null, dist, port));

gulp.task('build', ['ts', 'stylus', 'jade', 'vendor'], () => {});



gulp.task('vendor', ['clean'], function () {

  //==========BUILDING RXJS BUNDLE===========//
  const Builder = require("systemjs-builder");

  let builderOptions = {
    normalize: true,
    runtime: false,
    sourceMaps: true,
    sourceMapContents: true,
    minify: true,
    mangle: false
  };
  let builder = new Builder('./');
  builder.config({
    paths: {
      "n:*": "node_modules/*",
      "rxjs/*": "node_modules/rxjs/*.js",
    },
    map: {
      "rxjs": "n:rxjs",
    },
    packages: {
      "rxjs": {main: "Rx.js", defaultExtension: "js"},
    }
  });

  builder.bundle('rxjs', 'dist/vendor/rxjs/Rx.js', builderOptions);

  //==========COPY VENDOR BUNDLES===========//
  let files = [
    // Using: <source file>, <plugin destination folder>, <file target name>

    // The very important stuff
    [`node_modules/core-js/client/shim.min.js`, `vendor/core-js/`],
    [`node_modules/zone.js/dist/zone.js`, `vendor/zone.js/`],
    [`node_modules/reflect-metadata/Reflect.js`, `vendor/reflect-metadata/`],
    // [`node_modules/rxjs/bundles/Rx.min.js`, `vendor/rxjs/`],

    // ### SystemJS ###

    [`node_modules/systemjs/dist/system.src.js`, `vendor/systemjs/`],
    [`node_modules/systemjs/dist/system.js`, `vendor/systemjs/`],
    [`node_modules/systemjs/dist/system-polyfills.src.js`, `vendor/systemjs/`],
    [`node_modules/systemjs/dist/system-polyfills.js`, `vendor/systemjs/`],
    [`node_modules/systemjs-debugger/index.js`, `vendor/systemjs/`],

    // ### Angular 2 ###

    [`node_modules/@angular/common/bundles/common.umd.js`, `vendor/@angular/`],
    [`node_modules/@angular/common/bundles/common.umd.min.js`, `vendor/@angular/`],

    [`node_modules/@angular/compiler/bundles/compiler.umd.js`, `vendor/@angular/`],
    [`node_modules/@angular/compiler/bundles/compiler.umd.min.js`, `vendor/@angular/`],

    [`node_modules/@angular/core/bundles/core.umd.js`, `vendor/@angular/`],
    [`node_modules/@angular/core/bundles/core.umd.min.js`, `vendor/@angular/`],

    [`node_modules/@angular/forms/bundles/forms.umd.js`, `vendor/@angular/`],
    [`node_modules/@angular/forms/bundles/forms.umd.min.js`, `vendor/@angular/`],

    [`node_modules/@angular/http/bundles/http.umd.js`, `vendor/@angular/`],
    [`node_modules/@angular/http/bundles/http.umd.min.js`, `vendor/@angular/`],

    [`node_modules/@angular/router/bundles/router.umd.js`, `vendor/@angular/`],
    [`node_modules/@angular/router/bundles/router.umd.min.js`, `vendor/@angular/`],

    [`node_modules/@angular/platform-browser/bundles/platform-browser.umd.js`, `vendor/@angular/`],
    [`node_modules/@angular/platform-browser/bundles/platform-browser.umd.min.js`, `vendor/@angular/`],

    [`node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js`, `vendor/@angular/`],
    [`node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.min.js`, `vendor/@angular/`],

    [`node_modules/@angular/upgrade/bundles/upgrade.umd.js`, `vendor/@angular/`],
    [`node_modules/@angular/upgrade/bundles/upgrade.umd.min.js`, `vendor/@angular/`],

    [`node_modules/@ng-bootstrap/ng-bootstrap/bundles/ng-bootstrap.js`, `vendor/@ng-bootstrap/`],

    [`node_modules/ng2-translate/bundles/ng2-translate.umd.js`, `vendor/ng2-translate/`],

    [`node_modules/ng2-contextmenu/bundles/contextmenu.umd.js`, `vendor/ng2-contextmenu/`],

    [`node_modules/file-saver/FileSaver.js`, `vendor/file-saver/`],

    [`node_modules/ng2-file-upload/bundles/ng2-file-upload.umd.min.js`, `vendor/ng2-file-upload/`],
  ];
  let options = {cwd : dist, overwrite : true};

  return merge(files.map(function (f) {
    return gulp.src(f[0])
      .pipe(gulp.dest(f[1], options))
  }));
});