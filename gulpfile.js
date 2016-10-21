'use strict';

const gulp = require('gulp'),
	util = require('gulp-util'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	eslint = require('gulp-eslint'),
	plumber = require('gulp-plumber'),
	uglify = require('gulp-uglify'),
	mocha = require('gulp-mocha'),
	karmaServer = require('karma').Server,
	sass = require('gulp-sass'),
	cssnano = require('gulp-cssnano'),
	autoprefixer = require('gulp-autoprefixer'),
	spawn = require('child_process').spawn,
	exec = require('child_process').exec;
let node,
	mongo;

function killProcessByName(name){
	exec('ps -e | grep '+name, function(error, stdout, stderr) {
		if (error) throw error;
		if (stderr) console.log('stderr: ',stderr);
		if (stdout) {
			//console.log('killing running processes:', stdout);
			const runningProcessesIDs = stdout.match(/\d{3,6}/);
			runningProcessesIDs.forEach((id) => {
				exec('kill '+id, function(error, stdout, stderr) {
					if (error) throw error;
					if (stderr) console.log('stdout: ', stdout);
					if (stdout) console.log('stderr: ', stderr);
				});
			});
		}
	});
}

gulp.task('database', function() {
	if (mongo) mongo.kill();
	mongo = spawn('mongod', ['--smallfiles'], {stdio: 'inherit'});
	mongo.on('close', function (code) {
		if (code === 8) {
			gulp.log('Error detected, waiting for changes...');
		}
	});
});

gulp.task('server', function() {
	if (node) node.kill();
	node = spawn('node', ['server.js'], {stdio: 'inherit'});
	node.on('close', function (code) {
		if (code === 8) {
			gulp.log('Error detected, waiting for changes...');
		}
	});
});

gulp.task('server-test', function () {
	return gulp.src(['./test/server/*.js'], { read: false })
		.pipe(mocha({ reporter: 'spec' }))
		.on('error', util.log);
});

gulp.task('client-unit-test', function (done) {
	new karmaServer({
		configFile: require('path').resolve('test/karma.conf.js'),
		singleRun: true
	}, function () {
		console.log('done');
		done();
	}).start();
});

gulp.task('concat-and-uglify-js', function(){
	return gulp.src('./public/app/**/*.js')
		.pipe(plumber())
		.pipe(concat('packed-app.js'))
		.pipe(uglify())
		.pipe(plumber.stop())
		.pipe(rename('packed-app.min.js'))
		.pipe(gulp.dest('./public/js'));
});

gulp.task('sass-autoprefix-minify-css', function(){
	return gulp.src('./public/app/scss/*.scss')
		.pipe(plumber())
		.pipe(concat('packed-app.css'))
		.pipe(sass())
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(cssnano())
		.pipe(plumber.stop())
		.pipe(rename('packed-app.min.css'))
		.pipe(gulp.dest('./public/css'));
});

gulp.task('lint', function() {
	return gulp.src(['./app/**', './public/**/*.js', './*.js']) // uses ignore list from .eslintignore
		.pipe(eslint('./.eslintrc.json'))
		.pipe(eslint.format());
});

gulp.task('watch', function(){
	gulp.watch(['./server.js', './app/config/*.js', './app/routes/*.js', './app/utils/*.js'], ['server']); // watch server and database changes and restart server
	gulp.watch(['./server.js', './app/models/*.js'], ['database']); // watch database changes and restart database
	gulp.watch('./public/app/*.js', ['concat-and-uglify-js']); // watch app js changes, pack js, minify and put in respective folder
	gulp.watch('./public/app/scss/*.scss', ['sass-autoprefix-minify-css']); // watch app css changes, pack css, minify and put in respective folder
	gulp.watch(['./public/app/*.js','./test/client/unit/*.js','./test/karma.conf.js'], ['client-unit-test']); //watch unit test changes and run tests
	gulp.watch(['./test/server/test.js'], ['server-test']); // watch server changes and run tests
});

gulp.task('watch-and-lint', function () {
	gulp.watch(['./app/**', './public/**', './*.js', './.eslintignore', './.eslintrc.json'], ['lint']); // watch files to be linted or eslint config files and lint on change
});

gulp.task('default', ['database','server','lint','watch']);

process.on('exit', function() {
	if (node) node.kill();
	if (mongo) mongo.kill();
});

process.on('SIGINT', function() {
	killProcessByName('gulp');
});
