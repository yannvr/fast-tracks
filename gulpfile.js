/**
 * This example:
 *  Uses the built-in BrowserSync server for HTML files
 *  Watches & compiles SASS files
 *  Watches & injects CSS files
 */
var browserSync = require('browser-sync');
var reload      = browserSync.reload;
var gulp        = require('gulp'),
    sass = require('gulp-sass'),
    prefix = require('gulp-autoprefixer');

// Browser-sync task, only cares about compiled CSS
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./app"
        },
        open: false,
//        proxy:
        host: '127.0.0.1',
//        proxy: ''
        port: '3000'
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

// Sass task, will run when any SCSS files change.
gulp.task('sass', function () {
    return gulp.src('app/sass/*.scss')
        .pipe(sass({includePaths: ['app/sass']}))
        .pipe(gulp.dest('app/css'))
        .pipe(reload({stream:true}));
});

gulp.task('css', ['sass', 'auto-prefix'], function () {
    gulp.src('app/sass/*.scss')
//        .pipe(sass())
        .pipe(gulp.dest('app/css'));
});

gulp.task('sass-dev', function () {
    return gulp.src('app/scss/*.scss')
        .pipe(sass({ errLogToConsole: true, sourceComments: 'map', sourceMap: 'sass' }))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({stream: true}));
});

// process JS files and return the stream.
gulp.task('js', function () {
    return gulp.src('js/*.js')
        .pipe(browserSync.reload({stream: true}))
        //.pipe(uglify())
        //.pipe(gulp.dest('dist/js'));
})

gulp.task('html', function () {
    return gulp.src('partial/**/*.html')
        .pipe(browserSync.reload({stream: true}))
        //.pipe(uglify())
        //.pipe(gulp.dest('dist/js'));
});

// create a task that ensures the `js` task is complete before
// reloading browsers
gulp.task('js-watch', ['js'], browserSync.reload);

// use default task to launch Browsersync and watch JS files
gulp.task('serve', ['js'], function () {

    // Serve files from the root of this project
    browserSync({
        server: {
            baseDir: "./app"
        }
    });

    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
    gulp.watch("app/js/**/*.js", ['js-watch']);
    gulp.watch("app/scss/*.scss", ['sass']);
    gulp.watch("app/**/*.html", ['html']);
});

// Default task to be run with `gulp`
gulp.task('default', ['sass', 'browser-sync'], function () {
    gulp.watch("app/scss/*.scss", ['sass']);
});