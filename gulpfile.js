var gulp = require('gulp');
var process = require('child_process');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var minify = require('gulp-minify-css');
var prefix = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var bust = require('gulp-buster');
var clean = require('gulp-clean');
var nodemon = require('gulp-nodemon');

var changed = require('gulp-changed');
var refresh = require('gulp-livereload');
var lr = require('tiny-lr');
var server = lr();

var sassFiles = 'assets/stylesheets/*.scss';
var jsFiles = 'assets/javascripts/*.js';
var sassDest = 'public/stylesheets';
var jsDest = 'public/javascripts';

gulp.task('default', ['cache-bust']);

gulp.task('lr-server', function() {
  server.listen(35729, function(err) {
      if(err) return console.log(err);
  });
});

gulp.task('heroku:production', function(){
  gulp.start('cache-bust');
})

gulp.task('watch', function(){
  gulp.start('lr-server','cache-bust');

  // watch .scss files
  gulp.watch('assets/stylesheets/**/*.scss', ['build-stylesheets']);

  // watch .js files
  gulp.watch('assets/javascripts/**/*.js', ['build-javascripts']);

  console.log('Starting server with nodemon (it will reload on file-change)');
  nodemon({
      script: 'bin/www',
      env: { 'NODE_ENV': 'development' },
      nodeArgs: ['--debug'],
      ext: 'js jade',
      ignore: ['./assets/**']
    })
    .on('restart', function (){
      console.log('restarted!');
    });
});

gulp.task('build-stylesheets', ['clean-stylesheets'], function(){
  return gulp.src(sassFiles)
    .pipe(changed(sassDest, { extension: '.css' }))
    .pipe(sass({
      errLogToConsole: true,
      // example including assets from Bower
      // includePaths: ['./bower_components/normalize-scss', 'bower_components/neat/app/assets/stylesheets']
      includePaths: ['']
    }))
    .pipe(concat('main.min.css'))
    .pipe(prefix())
    .pipe(minify({
      keepSpecialComments: 0
    }))
    .pipe(gulp.dest(sassDest))
    .pipe(refresh(server));
});

gulp.task('build-javascripts', ['clean-javascripts'], function() {
  return gulp.src([
      './bower_components/jquery/dist/jquery.min.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(jsDest))
    .pipe(refresh(server));
});

gulp.task('clean-stylesheets', function(){
  return gulp.src('public/stylesheets/*', {read: false})
    .pipe(clean({force: true}));
});
gulp.task('clean-javascripts', function(){
  return gulp.src('public/javascripts/*', {read: false})
    .pipe(clean({force: true}));
});

gulp.task('cache-bust', ['build-stylesheets', 'build-javascripts'], function(){
  return gulp.src(['./public/javascripts/*.js', './public/stylesheets/*.css'])
    .pipe(bust("cache-bust.json"))
    .pipe(gulp.dest("."));
});
