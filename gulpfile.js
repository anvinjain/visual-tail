var gulp = require('gulp');
var less = require('gulp-less');
var prefix = require('gulp-autoprefixer');
var minify = require('gulp-minify-css');
var notify = require('gulp-notify');
var argv = require('yargs').argv;
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var packageJson = require(__dirname + '/package.json');
var _ = require('underscore');


var entries = ['./index.js', 'tracker_announces.js'];
// add custom browserify options here
// var customOpts = {
//   debug: true
// };

// var opts = {};
// _.extend(opts, watchify.args, customOpts);
// var b = watchify(browserify(opts)); 

gulp.task('build', bundle);


// b.on('update', bundle); // on any dep update, runs the bundler
// b.on('log', gutil.log); // output build logs to terminal

gulp.task('default', [ 'build' ]);

bundlers = [];
entries.forEach(entry => {
    var customOpts = {
        debug: true,
        entries: [ entry ]
    }
    var opts = {};
    _.extend(opts, watchify.args, customOpts);
    var b = watchify(browserify(opts)); 
    var bundler = bundleEntry(b, entry);
    b.on('update', bundler); // on any dep update, runs the bundler
    b.on('log', gutil.log); // output build logs to terminal
    bundlers.push(bundler);
});

function bundle() {
    bundlers.forEach(b => b());
}

function bundleEntry(b, entry) {
    return function() {
        b.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source(entry))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest('./dist/js'));
    }
}

gulp.task('less', function () {
  var stream = gulp.src('css/*.less')
      .pipe(less())
      .pipe(prefix())
      .on('error', notify.onError({
          title: 'Less Error',
          message: '<%= error.message %>',
          emitError: true
      }))
      .on('error', function () {
          this.emit('end');
      });

  if (argv.release) {
      stream = stream.pipe(minify());
  }

  return stream.pipe(gulp.dest('dist/css/'));
});