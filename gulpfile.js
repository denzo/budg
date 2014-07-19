// Constants
var DIST_DIR = 'dist',
	DIST_BOWER_DIR = DIST_DIR + '/bower_components',
	DIST_SCRIPTS_DIR = DIST_DIR + '/scripts',
    DIST_CSS_DIR = DIST_DIR + '/styles',
    DIST_SASS_DIR = DIST_DIR + '/styles',
    DIST_COMPILED_HBS_FILE = 'templates.js',
    DIST_COMPILED_CSS_FILE = 'style.css',

    SOURCE_DIR = 'src',
    SOURCE_BOWER_DIR = 'bower_components',
    SOURCE_HBS_DIR = SOURCE_DIR + '/templates',
    SOURCE_JS_APP_DIR = SOURCE_DIR + '/scripts',
    SOURCE_CSS_DIR = SOURCE_DIR + '/styles',
    SOURCE_SASS_DIR = SOURCE_DIR + '/styles',
    SOURCE_INDEX_HTML_FILE = 'index.html',
    
    SERVER_HOST = 'localhost',
    SERVER_HTTP_PORT = '3000';

// Dependencies
var browserSync = require('browser-sync'),
    gulp = require('gulp'),
    rimraf = require('gulp-rimraf'),
    changed = require('gulp-changed'),
    handlebars = require('gulp-ember-handlebars'),
    inject = require('gulp-inject'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    bower = require('main-bower-files')(),
    sass = require('gulp-sass'),
    newer = require('gulp-newer'),
    watch = require('gulp-watch'),
    ftp = require('gulp-ftp'),
    concat = require('gulp-concat');

/**
 * [description]
 * @return void
 */
gulp.task('ftp', function () {
    return gulp.src(DIST_DIR + '/**/*')
    	.pipe(ftp({
    		host: '50.63.82.1',
    		user: 'budg2',
    		pass: 'aCid303#'
    	}));
});

/**
 * [description]
 * @return void
 */
gulp.task('local:js', function () {
    return gulp.src(SOURCE_JS_APP_DIR + '/**/*.js')
    	.pipe(newer(DIST_SCRIPTS_DIR))
    	.pipe(jshint())
    	.pipe(jshint.reporter(stylish))
		.pipe(gulp.dest(DIST_SCRIPTS_DIR));
});

/**
 * [description]
 * @return {object} Node.js Stream object
 */
gulp.task('local:css', function () {
	return gulp.src(SOURCE_CSS_DIR + '/**/*.css')
		.pipe(concat(DIST_COMPILED_CSS_FILE))
		.pipe(gulp.dest(DIST_CSS_DIR));
});

/**
 * Sources all the bower files from the bower.json file and copies them into 
 * the dist folder. Please note that only the files specified in "main" property 
 * of each package will be copied across.
 * @return {object} Node.js Stream object
 */
gulp.task('local:bower', function () {
	return gulp.src(bower, {base: SOURCE_BOWER_DIR})
    	.pipe(newer(DIST_BOWER_DIR))
		.pipe(gulp.dest(DIST_BOWER_DIR));
});

/**
 * [description]
 * @return {object} Node.js Stream object
 */
gulp.task('local:handlebars', function() {
	return gulp.src(SOURCE_HBS_DIR + '/**/*.hbs')
		.pipe(newer(DIST_DIR + '/' + DIST_COMPILED_HBS_FILE))
		.pipe(handlebars({outputType: 'browser'}))
		.pipe(concat(DIST_COMPILED_HBS_FILE))
		.pipe(gulp.dest(DIST_DIR));
});

/**
 * [description]
 * @return {object} Node.js Stream object
 */
gulp.task('local:build', [
        'local:js',
        'local:css',
        'local:bower',
        'local:handlebars'
    ], function () {
        return gulp.src(SOURCE_DIR + '/' + SOURCE_INDEX_HTML_FILE)
        	.pipe(
	            inject(
	                gulp.src(bower, {
	                	read: false
	                }), {
	                    starttag: '<!-- inject:bower -->',
	                    addRootSlash: false
	                }
	            )
	        )
        	.pipe(
	            inject(
	                gulp.src(SOURCE_JS_APP_DIR + '/**/*.js', {
	                    read: false
	                }), {
	                    starttag: '<!-- inject:js -->',
	                    ignorePath: SOURCE_DIR,
	                    addRootSlash: false
	                }
	            )
	        )
        	.pipe(
	            inject(
	                gulp.src(DIST_CSS_DIR + '/**/*.css', {
	                    read: false
	                }), {
	                    starttag: '<!-- inject:css -->',
	                    ignorePath: DIST_DIR,
	                    addRootSlash: false
	                }
	            )
	        )
            .pipe(gulp.dest(DIST_DIR));
    }
);

/**
 * [description]
 * @return {object} Node.js Stream object
 */
gulp.task('local:reload', ['local:build'], function() {
	browserSync.reload();
});

/**
 * [description]
 * @return {object} Node.js Stream object
 */
gulp.task('local:watch', function() {
	watch({glob: SOURCE_DIR + '/**/*'}, function(files) {
    	gulp.start(['local:build', 'local:reload']);
    	return files;
    });
});

/**
 * [description]
 * @return void
 */
gulp.task('local:server', ['local:build'], function() {
    browserSync.init(null, {
        server: {
            baseDir: DIST_DIR
        },
        proxy: {
            host: SERVER_HOST,
            port: SERVER_HTTP_PORT
        }
    });
});

/**
 * [description]
 * @return {object} Node.js Stream object
 */
gulp.task('clean', function () {
    return gulp.src(DIST_DIR, {read: false}).pipe(rimraf());
});

/**
 * [description]
 * @return {object} Node.js Stream object
 */
gulp.task('default', ['clean'], function() {
	gulp.start(['local:server', 'local:watch']);
});








