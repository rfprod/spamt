'use strict';

const gulp = require('gulp'),
	util = require('gulp-util'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	eslint = require('gulp-eslint'),
	tslint = require('gulp-tslint'),
	plumber = require('gulp-plumber'),
	mocha = require('gulp-mocha'),
	karmaServer = require('karma').Server,
	sass = require('gulp-sass'),
	cssnano = require('gulp-cssnano'),
	autoprefixer = require('gulp-autoprefixer'),
	systemjsBuilder = require('gulp-systemjs-builder'),
	runSequence = require('run-sequence'),
	spawn = require('child_process').spawn,
	exec = require('child_process').exec;
let node,
	mongo,
	tsc;

function killProcessByName(name){
	exec('ps -e | grep '+name, (error, stdout, stderr) => {
		if (error) throw error;
		if (stderr) console.log('stderr: ',stderr);
		if (stdout) {
			//console.log('killing running processes:', stdout);
			const runningProcessesIDs = stdout.match(/\d{3,6}/);
			runningProcessesIDs.forEach((id) => {
				exec('kill '+id, (error, stdout, stderr) => {
					if (error) throw error;
					if (stderr) console.log('stdout: ', stdout);
					if (stdout) console.log('stderr: ', stderr);
				});
			});
		}
	});
}

gulp.task('database', () => {
	if (mongo) mongo.kill();
	mongo = spawn('mongod', ['--smallfiles', '--nojournal'], {stdio: 'inherit'});
	mongo.on('close', (code) => {
		if (code === 8) {
			console.log('Error detected, waiting for changes...');
		}
	});
});

gulp.task('server', () => {
	if (node) node.kill();
	node = spawn('node', ['server.js'], {stdio: 'inherit'});
	node.on('close', (code) => {
		if (code === 8) {
			console.log('Error detected, waiting for changes...');
		}
	});
});

gulp.task('tsc', (done) => {
	if (tsc) tsc.kill();
	tsc = spawn('npm', ['run', 'tsc'], {stdio: 'inherit'});
	tsc.on('error', (err) => {
		console.log('Error', err);
	})
	tsc.on('close', (code) => {
		if (code === 8) {
			console.log('Error detected, waiting for changes...');
		} else {
			done();
		}
	});
});

gulp.task('server-test', () => {
	return gulp.src(['./test/server/*.js'], { read: false })
		.pipe(mocha({ reporter: 'spec' }))
		.on('error', util.log);
});

gulp.task('client-unit-test', (done) => {
	const server = new karmaServer({
		configFile: require('path').resolve('test/karma.conf.js'),
		singleRun: false
	});

	server.on('browser_error', (browser, err) => {
		console.log('=====\nKarma > Run Failed\n=====\n', err);
		throw err;
	});

	server.on('run_complete', (browsers, results) => {
		if (results.failed) {
			throw new Error('=====\nKarma > Tests Failed\n=====\n', results);
		}
		console.log('=====\nKarma > Complete With No Failures\n=====\n', results);
		done();
	});

	server.start();
});

gulp.task('build-system-js', () => {
	const builder = systemjsBuilder('/','./systemjs.config.js');
	builder.buildStatic('app', 'bundle.min.js', {
		minify: true,
		mangle: true
	})
	.pipe(gulp.dest('./public/js'));
});

gulp.task('sass-autoprefix-minify-css', () => {
	return gulp.src('./public/app/scss/*.scss')
		.pipe(plumber())
		.pipe(concat('packed-app.css'))
		.pipe(sass())
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(cssnano())
		.pipe(plumber.stop())
		.pipe(rename('bundle.min.css'))
		.pipe(gulp.dest('./public/css'));
});

gulp.task('eslint', () => {
	return gulp.src(['./app/**', './public/js/*.js', './*.js']) // uses ignore list from .eslintignore
		.pipe(eslint('./.eslintrc.json'))
		.pipe(eslint.format());
});

gulp.task('tslint', () => {
	return gulp.src(['./public/app/*.ts', './public/app/**/*.ts'])
		.pipe(tslint({
			formatter: 'verbose' // 'verbose' - extended info | 'prose' - brief info
		}))
		.pipe(tslint.report({
			emitError: false
		}));
});

gulp.task('lint', ['eslint','tslint']);

gulp.task('watch', () => {
	gulp.watch(['./server.js', './app/config/*.js', './app/routes/*.js', './app/utils/*.js'], ['server']); // watch server and database changes and restart server
	gulp.watch(['./server.js', './app/models/*.js'], ['database']); // watch database changes and restart database
	gulp.watch(['./public/app/*.js', './public/app/**/*.js'], ['build-system-js']); // watch app js changes and build system
	gulp.watch('./public/app/scss/*.scss', ['sass-autoprefix-minify-css']); // watch app css changes, pack css, minify and put in respective folder
	gulp.watch(['./test/server/test.js'], ['server-test']); // watch server tests changes and run tests
});

gulp.task('watch-and-lint', () => {
	gulp.watch(['./app/**', './public/js/*.js', './*.js', './.eslintignore', './.eslintrc.json'], ['eslint']); // watch js files to be linted or eslint config and lint on change
	gulp.watch(['./public/app/*.ts', './public/app/**/*.ts', './tslint.json'], ['tslint']); // watch ts files to be linted or tslint config and lint on change
});

gulp.task('watch-client-and-test', () => {
	gulp.watch(['./public/app/*.ts','./test/client/*.ts'], ['tsc']);
	gulp.watch(['./public/app/*.js','./test/client/*.js','./test/karma.conf.js','./test/karma.test-shim.js'], ['client-unit-test']); //watch unit test changes and run tests
});

gulp.task('default', ['database','build-system-js','sass-autoprefix-minify-css','lint','server','watch','watch-and-lint']);

gulp.task('build', (done) => {
	runSequence('sass-autoprefix-minify-css', 'tsc', 'build-system-js', done);
});

gulp.task('production-start', ['build', 'database', 'server']);

process.on('exit', () => {
	if (node) node.kill();
	if (mongo) mongo.kill();
	if (tsc) tsc.kill();
});

['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
	'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
].forEach((element) => {
	process.on(element, () => {
		if (node) node.kill();
		if (mongo) mongo.kill();
		if (tsc) tsc.kill();
		killProcessByName('gulp');
	});
});
