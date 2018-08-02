const gulp = require("gulp");
const del = require('del');
const imageMin = require('imagemin');
const webp = require('gulp-webp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const $ = require('gulp-load-plugins')();
const responsive = require('gulp-responsive');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('clean:dist', function() {
    return del.sync('dist');
});

gulp.task('msg',()=>console.log('Gulp is running...'));

gulp.task('html-copy', () =>
    gulp
  .src('src/*.html')
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.stream())
);

gulp.task('sw-copy', () =>
  gulp.src('src/sw.js')
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.stream())
);

gulp.task('manifest-copy', () =>
  gulp.src('src/manifest.json')
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.stream())
);

gulp.task('images-webp', () =>
  gulp.src('src/img/*.jpg')
  .pipe(webp())
  .pipe(gulp.dest('src/img'))
  .pipe(browserSync.stream())
);

gulp.task('images-resize', function () {
  return gulp.src('src/img/*.{jpg,webp}')
    .pipe($.responsive({
      '*.{jpg,webp}': [{
        width: 300,
        rename: { suffix: '_w_300' },
      }, {
        width: 500,
        rename: { suffix: '_w_500' },
      }, {
        width: 800,
        rename: { suffix: '_w_800' },
      }],
    }, {
      quality: 30,
      progressive: true,
      compressionLevel: 12,
      withMetadata: false,
    }))
    .pipe(gulp.dest('dist/img'))
    .pipe(browserSync.stream())
});

gulp.task('css-minify', () => {
   gulp
     .src('src/css/**/*.css')
     .pipe(cleanCSS({debug: true}))
     .pipe(rename({suffix: '.min'}))
     .pipe(gulp.dest('dist/css'))
     .pipe(browserSync.stream())
});

gulp.task('js-babel-test', () =>
    gulp.src(['src/js/dbhelper.js','src/js/restaurant_info.js','src/js/main.js'])
    //  .pipe(sourcemaps.init())
    //    .pipe(babel({
    //        presets: ['env']
    //    }))
    //    .pipe(uglify())
    //    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream())
);


gulp.task('js-babel', () => {
  return gulp.src([
    'src/js/dbhelper.js', 'src/js/main.js', 'src/js/restaurant_info.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    // .pipe(concat('app.min.js'))
    // .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream())
});

gulp.task('js-mini-main', () => {
  return gulp.src([
    'src/js/dbhelper.js', 'src/js/main.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'))
    //      .pipe(browserSync.stream())
});

gulp.task('uglify', ()=>{
    gulp
      .src('dist/js/*.js')
      .pipe(concat('main'))
      .pipe(rename({suffix: '.min.js'}))
      .pipe(uglify())
      .pipe(gulp.dest('dist/js'))
    //      .pipe(browserSync.stream());
});

//Watch sass & server
gulp.task('serve',['html-copy'],()=>{
     browserSync.init({
         server:"./dist"
     });
    gulp.watch(['src/*.html'], ['html-copy']);
    gulp.watch(['src/css/*.css'], ['css-minify']);
    gulp.watch(['src/js/*.js'], ['js-babel-test']);
    gulp.watch(['src/sw.js'], ['sw-copy']);
    gulp.watch(['src/manifes.jason'], ['manifest-copy']);
    gulp.watch(['src/img/*'], ['images-resize']);
    gulp.watch(['dist/*.html',
                'dist/css/*.css',
                'dist/js/*.js',
                'dist/imgs/*',
                'dist/fonts/*']).on('change',browserSync.reload);
});

gulp.task('default',['msg','html-copy','sw-copy','manifest-copy','images-webp','images-resize','css-minify','js-babel-test','serve']);

