// Подключаем пакеты
const { src, dest, series, parallel, watch } = require('gulp'),
      pug = require('gulp-pug'),
      sass = require('gulp-sass'),
      cleanCSS = require('gulp-clean-css'),
      autoprefixer = require('gulp-autoprefixer'),
      sourcemaps = require('gulp-sourcemaps'),
      browserSync = require('browser-sync').create(),
      concat = require('gulp-concat'),
      uglify = require('gulp-uglify'),
      tinypngFree = require('gulp-tinypng-free'),
      del = require('del');

/*** Функции ***/
// Pug
function pugF() {
    return src('./src/pug/pages/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(dest('build'));
}

// Sass
function sassF() {
    return src('./src/static/sass/main.scss')
        .pipe(sourcemaps.init())
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer({
                browsers: ['last 2 versions'],
                cascade: false
            }))
            .pipe(cleanCSS({
                compatibility: 'ie8',
                level: 2
            }))
        .pipe(sourcemaps.write())
        .pipe(dest('./build/static/css'))
        .pipe(browserSync.stream());
}

// Javascript
// Libs files
const libsJs = [
  './node_modules/jquery/dist/jquery.min.js',
  './node_modules/slick-carousel/slick/slick.min.js'
];

// Libs.min.js
function libsF() {
    return src(libsJs)
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(dest('./build/static/js'))
        .pipe(browserSync.stream());
}

// Main.js
function jsF() {
    return src('./src/static/js/main.js')
        .pipe(sourcemaps.init())
            .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(dest('./build/static/js'))
        .pipe(browserSync.stream());
}

// Images
function imgDevF() {
    return src('./src/static/img/**/*')
        .pipe(dest('./build/static/img'));
}

function imgBuildF() {
    return src('./src/static/img/**/*')
        .pipe(tinypngFree({
            force: true
        }))
        .pipe(dest('./build/static/img'));
}

// Browser-sync
function serveF() {
    browserSync.init({
        server: {
            baseDir: './build'
        }
    })
}

// Del
function clearF() {
    return del(['build']);
}

function delImg() {
    return del(['build/static/img']);
}

// Watchers
watch(['./src/pug/**/*.pug']).on('change', series(pugF, browserSync.reload));
watch('./src/static/sass/**/*.scss', sassF);
watch('./src/static/js/main.js', jsF);
watch(['./src/static/img/**/*']).on('change', series(imgDevF, browserSync.reload));
watch(['./src/static/img/**/*']).on('add', series(imgDevF, browserSync.reload));
watch(['./src/static/img/**/*']).on('unlink', series(delImg, imgDevF, browserSync.reload));

// Exports
exports.sass = sassF;
exports.pug = pugF;
exports.libs = libsF;
exports.js = jsF;
exports.imgdev = imgDevF;
exports.imgbuild = imgBuildF;
exports.clear = clearF;

exports.default = series(
    clearF,
    parallel(pugF, sassF, libsF, jsF, imgDevF),
    serveF
);

exports.build = series(
    clearF,
    parallel(pugF, sassF, libsF, jsF, imgBuildF),
    serveF
);

