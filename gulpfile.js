const gulp = require('gulp'),
 concat = require('gulp-concat'),
 sass = require('gulp-sass'),
 child = require('child_process'),
 gutil = require('gulp-util'),
 del = require('del'),
 debug = require('gulp-debug'),
cssnano = require('gulp-cssnano'),
autoprefixer = require('gulp-autoprefixer'),
stripComments = require('gulp-strip-json-comments'),
browserSync = require('browser-sync').create(),
embedJSON = require('gulp-embed-json'),
gulpSequence = require('gulp-sequence'),
sitemap = require('gulp-sitemap'),
stripJS = require('gulp-strip-comments'),
uglify = require('gulp-uglify'),
htmlmin = require('gulp-htmlmin'),
newer = require('gulp-newer'),
run = require('gulp-run'),
cp = require('child_process'),
workboxBuild = require('workbox-build'),
siteRoot = '_site',
imageRoot = './devassets/img/**/*',
imageDest = './assets/img',
imageDestBlob = './assets/img/**/*',
fontRoot = './devassets/fonts/',
fontDest = './assets/fonts/',
cssFiles = 'devassets/scss/app.scss';

gulp.task('css', () => {
  gulp.src(cssFiles)
    .pipe(sass({ 
        outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(stripComments())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(cssnano()) // Use cssnano to minify CSS
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('assets/css/'))
});

gulp.task('dev:css', () => {
    gulp.src(cssFiles)
      .pipe(sass({ 
          sourceComments: 'map',
          sourceMap: 'sass'
      }).on('error', sass.logError))
      .pipe(stripComments())
      .pipe(autoprefixer('last 2 versions'))
      .pipe(concat('styles.css'))
      .pipe(gulp.dest('assets/css/'))
  });

// Generate Manifest JSON for PWA
gulp.task('manifest', function () {
    gulp.src('manifest.json')
        .pipe(gulp.dest(siteRoot));
});

gulp.task('sw', function(){
    console.log('Generating Service Worker');
    return workboxBuild.generateSW({
        globDirectory: '_site',
        globPatterns: [
        '**\/*.{html,js,css,jpg,png,woff,svg}',
        ],
        swDest: 'sw.js',
        clientsClaim: true,
        skipWaiting: true
    });
});

//Copy Images from dev assets to assets
gulp.task('dev:images', function () {
    console.log('Copying images');
    gulp.src(imageRoot)
    .pipe(newer(imageDest))
    .pipe(gulp.dest(imageDest))
});

//Copy Images from dev assets to assets
gulp.task('images', function () {
    console.log('Copying images');
    gulp.src(imageRoot)
    .pipe(debug())
    .pipe(gulp.dest(imageDest))
});

//Copy Images from dev assets to assets
gulp.task('del:image', function () {
    console.log('Cleaning images');
    return del(imageDestBlob);
});

// Places font files in the assets folder
gulp.task('font', function () {
    return gulp.src([
            fontRoot + '/*.eot', 
            fontRoot + '/*.woff', 
            fontRoot + '/*.woff2', 
            fontRoot + '/*.ttf', 
            fontRoot + '/*.otf',
            fontRoot + '/*.svg'
        ])
        .pipe(newer(fontDest))
        .pipe(gulp.dest(fontDest))
        console.log('Copying fonts into assets folder');
});

// Generate Embed JSON
gulp.task('embedjson', function (done) {
    console.log('Embedding JSON+LD');
    gulp.src(siteRoot + '/**/*.html')
        .pipe(embedJSON({
            mimeTypes: 'application/ld+json',
            root: './devassets/json/',
            minify: true
        }))
        .pipe(gulp.dest(siteRoot).on('finish', function(){
            console.log('Embed JSON really finished');
            done();
		}));
});

// Generate Minified html
gulp.task('minhtml', function () {
    console.log('Minifying HTML');
    gulp.src(siteRoot + '/**/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(siteRoot));
});


// Generate Sitemaps
gulp.task('sitemap', function () {
    gulp.src(siteRoot + '/**/*.html', {
            read: false
        })
        .pipe(sitemap({
            siteUrl: 'https://www.bizmarketing.us/',
            priority: function(siteUrl, loc, entry) {
                // Give pages inside root path (i.e. no slashes) a higher priority
                return (loc === siteUrl)? 1 : 0.5;
            }
        }))
        .pipe(gulp.dest('./'));
});

// gulp.task('build:jekyll', function() {
//     var shellCommand = 'bundle exec jekyll build --config _config.yml';

//     return gulp.src('')
//         .pipe(run(shellCommand))
//         .on('error', gutil.log);
// });

gulp.task('build:jekyll', function(done) {
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
    .on('close', done);
});

gulp.task('jekyll', () => {
    const jekyll = child.spawn('bundle', ['exec', 'jekyll', 'build',
      '--watch',
      '--incremental',
      '--drafts'
    ]);
  
    const jekyllLogger = (buffer) => {
      buffer.toString()
        .split(/\n/)
        .forEach((message) => gutil.log('Jekyll: ' + message));
    };
  
    jekyll.stdout.on('data', jekyllLogger);
    jekyll.stderr.on('data', jekyllLogger);
  });

gulp.task('serve', () => {
  browserSync.init({
    files: [siteRoot + '/**'],
    port: 4000,
    server: {
      baseDir: siteRoot
    }
  });
});

// Concatenating js files
gulp.task('scripts', function () {
    // jQuery first, then Popper.js, then Bootstrap JS, then other JS libraries, and last app.js
    return gulp.src([
            'devassets/js/core/jquery.min.js', 
            'devassets/js/core/popper.min.js', 
            'devassets/js/core/bootstrap.min.js', 
            // 'devassets/js/plugins/moment.min.js', 
            // 'devassets/js/plugins/bootstrap-tagsinput.js', 
            // 'devassets/js/plugins/presentation-page/rellax.min.js', 
            'devassets/js/plugins/jquery.affix.js',
            // 'devassets/js/plugins/bootstrap-datetimepicker.js', 
            // 'devassets/js/plugins/bootstrap-selectpicker.js', 
            // 'devassets/js/plugins/bootstrap-switch.js', 
            'devassets/js/plugins/jasny-bootstrap.min.js', 
            'devassets/js/plugins/jquery-ui-1.12.1.custom.min.js', 
            // 'devassets/js/plugins/nouislider.min.js', 
            'devassets/js/now-ui-kit.js', 
            'devassets/js/loadCSS.js',
            'devassets/js/jquery.lazy.min.js',
            'devassets/js/app.js'
        ])
        .pipe(concat('app.js'))
        .pipe(stripJS())
        .pipe(uglify().on('error', function(e){
            console.log(e);
         }))
        .pipe(gulp.dest('./assets/js/'))
        console.log('Concatenating JavaScript files into single file');
});

// Concatenating js files
gulp.task('dev:scripts', function () {
    // jQuery first, then Popper.js, then Bootstrap JS, then other JS libraries, and last app.js
    return gulp.src([
            'devassets/js/core/jquery.min.js', 
            'devassets/js/core/popper.min.js', 
            'devassets/js/core/bootstrap.min.js', 
            // 'devassets/js/plugins/moment.min.js', 
            // 'devassets/js/plugins/bootstrap-tagsinput.js', 
            // 'devassets/js/plugins/presentation-page/rellax.min.js',
            'devassets/js/plugins/jquery.affix.js', 
            // 'devassets/js/plugins/bootstrap-datetimepicker.js', 
            // 'devassets/js/plugins/bootstrap-selectpicker.js', 
            // 'devassets/js/plugins/bootstrap-switch.js', 
            'devassets/js/plugins/jasny-bootstrap.min.js', 
            'devassets/js/plugins/jquery-ui-1.12.1.custom.min.js', 
            // 'devassets/js/plugins/nouislider.min.js', 
            'devassets/js/now-ui-kit.js', 
            'devassets/js/loadCSS.js',
            'devassets/js/jquery.lazy.min.js',
            'devassets/js/app.js'
        ])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./assets/js/'))
        console.log('Concatenating JavaScript files into single file');
});


// gulp.watch(cssFiles, ['css']);
// Watches for changes while gulp is running
gulp.task('watch', ['css', 'dev:scripts'], function () {
    // Live reload with BrowserSync
    browserSync.reload;
    gulp.watch(['_data/**/*.yml', '_includes/**/*.html', '_pages/**/*.html' ], ['jekyll', browserSync.reload]);
    gulp.watch(['devassets/js/**/*.js'], ['dev:scripts', browserSync.reload]);
    gulp.watch(['node_modules/bootstrap/scss/bootstrap.scss', 'devassets/scss/**/*.scss'], ['css', browserSync.reload]);
    console.log('Watching for changes');
});

gulp.task('build', gulpSequence(['css', 'font', 'images', 'scripts', 'manifest'], 'build:jekyll', 'sitemap', 'embedjson', 'minhtml'));
gulp.task('tiny-dev', gulpSequence(['dev:css', 'dev:scripts', 'jekyll', 'serve', 'watch']));
gulp.task('default-dev', gulpSequence(['dev:css',  'font', 'images', 'dev:scripts', 'jekyll', 'manifest', 'sitemap', 'serve', 'watch'], ['embedjson', 'sw']));
gulp.task('default', gulpSequence(['css',  'font', 'dev:images', 'scripts', 'jekyll', 'serve', 'watch']));