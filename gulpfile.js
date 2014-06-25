var autoprefixer = require('gulp-autoprefixer');
var bust = require('gulp-buster');
var cache = require('gulp-cached');
var concatCss = require('gulp-concat-css');
var concatSourceMap = require('gulp-concat-sourcemap');
var gulp = require('gulp');
var lr = require('tiny-lr');
var minify = require('gulp-minify-css');
var nodemon = require('gulp-nodemon');
var refresh = require('gulp-livereload');  
var rename = require('gulp-rename');
var rimraf = require('gulp-rimraf'); // terrible name, used to remove files
var sass = require('gulp-sass');
var server = lr();
var shell = require('gulp-shell');
var uglify = require('gulp-uglify');

var wiredep = require('wiredep')({
  // if you want to handle a bower asset specially add it here
  // exclude: [ /jquery/, 'bower_components/modernizr/modernizr.js' ],
  // exclude: ['foundation']
});

gulp.task('default', ['cache-bust']);
gulp.task('build-javascripts', ['clean-javascripts', 'bower-js', 'browserify']);
gulp.task('build-stylesheets', ['clean-stylesheets', 'styles']);

gulp.task('cache-bust', ['build-stylesheets', 'build-javascripts'], function(){
  return gulp.src(['./public/stylesheets/*.css', './public/javascripts/*.js'])
    .pipe(bust("cache-bust.json"))
    .pipe(gulp.dest("."));
});

gulp.task('heroku:production', function(){
  gulp.start('cache-bust');
})

gulp.task('lr-server', function() {
  server.listen(35729, function(err) {
      if(err) return console.log(err);
  });
});
gulp.task('watch', function(){
  gulp.start('lr-server','cache-bust');

  // watch .scss files
  gulp.watch('assets/stylesheets/**/*.scss', ['styles']);

  // watch .js files
  gulp.watch('assets/javascripts/**/*.js', ['bower-js', 'browserify']);

  console.log('Starting server with nodemon (it will reload on file-change)');
  nodemon({ 
      script: 'bin/www', 
      env: { 
        'NODE_ENV': 'development',
        'DEBUG': 'http,route:*'
      }, 
      nodeArgs: ['--debug'], 
      ext: 'js jade',
      ignore: [
        './assets/**',
        './node_modules/**',
        './bower_components/**'
      ]
    })
    .on('restart', function (){
      console.log('restarted!');
    });
});

// gulp.task('bower-css', function(){
//   if(typeof wiredep.css === 'undefined'){
//     return
//   }else{
//     return gulp.src(wiredep.css)
//     .pipe(cache('bower-styles'))
//     .pipe(minify({
//       keepSpecialComments: 0
//     }))
//     .pipe(concatCss('vendor.css'))
//     .pipe(gulp.dest('./public/stylesheets/'));
//   }
// });

gulp.task('styles', function(){
  return gulp.src('./assets/stylesheets/app.scss')
    .pipe(cache('styles'))
    .pipe(sass({
      errLogToConsole: true,
      // this is intended for 3rd party projects/styles that you want to customize or only want part of
      // this gives main.scss access to files in the listed paths
      // IMPORTANT: make sure you add the bower lib to wiredep above so it doesn't get included twice
      // includePaths: ['./bower_components/foundation/scss/']
    }))
    .pipe(autoprefixer())
    .pipe(minify({
      keepSpecialComments: 0
    }))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest('./public/stylesheets/'))
    .pipe(refresh(server));
});

gulp.task('bower-js', function(){
  return gulp.src(wiredep.js)
    .pipe(cache('bower-js'))
    .pipe(concatSourceMap('vendor.js', {
      // prefix: 3,
      // sourceRoot: '/javascripts/',
      // sourceMappingBaseURL: '/javascripts/'
    }))
    .pipe(gulp.dest('./public/javascripts/'));
});

gulp.task('browserify', function(){
  // return browserify('./assets/javascripts/app.js')
    // .bundle()
    // turn bundle into vinyl source stream
    // .pipe(source('app.min.js'))
    // .pipe(streamify(uglify()))

  return gulp.src('./assets/javascripts/app.js')
    .pipe(uglify())
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest('./public/javascripts/'))
    .pipe(refresh(server));
});

gulp.task('test', shell.task([
  'jasmine-node --autotest --color --growl spec'
]));

gulp.task('clean-stylesheets', function(){
  return gulp.src('public/stylesheets/*', {read: false})
    .pipe(rimraf({force: true}));
});
gulp.task('clean-javascripts', function(){
  return gulp.src('public/javascripts/*', {read: false})
    .pipe(rimraf({force: true}));
});
