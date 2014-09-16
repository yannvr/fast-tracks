var gulp = require('gulp'),
    prefix = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    sass = require('gulp-sass')
    //concat = require('gulp-concat'),
    //uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps');

gulp.task('browser-sync', function () {
   var files = [
      'app/**/*.html',
      'app/css/**/*.css',
      'app/img/**/*.png',
      'app/js/**/*.js'
   ];

   browserSync.init(files, {
      server: {
         baseDir: './app'
      }
   });
});

gulp.task('auto-prefix', function () {
    return gulp.src('app/css/app.css')
        .pipe(prefix({
            browsers: ['last 2 versions'],
            cascade: true
        }))
        .pipe(gulp.dest('app/css'));
});

gulp.task('sass',  function () {
    gulp.src('app/scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('app/css'));
});

gulp.task('css', ['sass', 'auto-prefix'], function () {
    gulp.src('app/scss/*.scss')
//        .pipe(sass())
        .pipe(gulp.dest('app/css'));
});

gulp.task('sass-dev', function() {
    return gulp.src( 'app/scss/*.scss' )
        .pipe( sass({ errLogToConsole: true, sourceComments: 'map', sourceMap: 'sass' }))
        .pipe( gulp.dest( 'app/css'  ) )
//        .pipe( browserSync( server ) );
});

// Default task to be run with `gulp`
gulp.task('default', ['sass', 'browser-sync'], function () {
    gulp.watch("app/scss/*.scss", ['sass']);
});