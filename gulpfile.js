'use strict';

const gulp = require('gulp'),
	runSequence = require('run-sequence'),
	util = require('gulp-util'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	eslint = require('gulp-eslint'),
	tslint = require('gulp-tslint'),
	plumber = require('gulp-plumber'),
	uglify = require('gulp-uglify'),
	mocha = require('gulp-mocha'),
	karmaServer = require('karma').Server,
	sass = require('gulp-sass'),
	cssnano = require('gulp-cssnano'),
	autoprefixer = require('gulp-autoprefixer'),
	systemjsBuilder = require('gulp-systemjs-builder'),
	hashsum = require('gulp-hashsum'),
	crypto = require('crypto'),
	fs = require('fs'),
	spawn = require('child_process').spawn,
	exec = require('child_process').exec;
let node,
	mongo,
	tsc;

function killProcessByName(name){
	exec('pgrep ' + name, (error, stdout, stderr) => {
		if (error) {
			// throw error;
			console.log('killProcessByName, error', error);
		}
		if (stderr) console.log('stderr: ',stderr);
		if (stdout) {
			//console.log('killing running processes:', stdout);
			const runningProcessesIDs = stdout.match(/\d{3,6}/);
			runningProcessesIDs.forEach((id) => {
				exec('kill -9 ' + id, (error, stdout, stderr) => {
					if (error) throw error;
					if (stderr) console.log('stdout: ', stdout);
					if (stdout) console.log('stderr: ', stderr);
				});
			});
		}
	});
}

function setDevEnv(value, done) {
	if (typeof value === 'boolean') {
		fs.readFile('./.env', (err, data) => {
			let env;
			if (err) {
				env = '';
			} else {
				env = data.toString();
			}
			if (env.indexOf('DEV_ENV=true') !== -1) {
				env = env.replace(/DEV_ENV=true.*\n/, 'DEV_ENV=false\n');
			}
			fs.writeFile('./.env', env, (err) => {
				if (err) throw err;
				console.log('# > ENV > .env file was created');
				if (done) done();
			});
		});
	} else {
		throw new TypeError('first argument must be boolean');
	}
}

gulp.task('dont-use-cluster', (done) => {
	setDevEnv(false, done);
});

gulp.task('use-cluster', (done) => {
	setDevEnv(true, done);
});

function dontGitignoreBuild(gitignore, done) {
	fs.writeFile('./.gitignore', gitignore, (err) => {
		if (err) throw err;
		console.log('# > ENV > .gitignore file was updated');
		done();
	});
}

gulp.task('dont-gitignore-build', (done) => {
	fs.readFile('./.gitignore', (err, data) => {
		let gitignore = '';
		if (err) {
			console.log('./.gitignore does not exist');
			dontGitignoreBuild(gitignore, done);
		} else {
			gitignore = data.toString()
				.replace(/public\/js\/\*\.min\.js\n/, '')
				.replace(/public\/css\/\*\.min\.css\n/, '')
				.replace(/public\/webfonts\/\*\.\*\n/, '')
				.replace(/public\/SHA1SUMS\.json\n/, '');
			console.log('./.gitignore exists, updated gitignore', gitignore);
			dontGitignoreBuild(gitignore, done);
		}
	});
});

/*
*	hashsum identifies build
*
*	after build SHA1SUMS.json is generated with sha1 sums for different files
*	then sha256 is calculated using stringified file contents
*/
gulp.task('hashsum', () => {
	return gulp.src(['./public/*', '!./public/SHA1SUMS.json', './public/app/views/**', './public/css/**', './public/webfonts/**', './public/img/**', './public/js/**'])
		.pipe(hashsum({ filename: 'public/SHA1SUMS.json', hash: 'sha1', json: true }));
});

function setBuildHashENV(done) {
	fs.readFile('./public/SHA1SUMS.json', (err, data) => {
		if (err) throw err;
		const hash = crypto.createHmac('sha256', data.toString()).digest('hex');
		console.log('BUILD_HASH', hash);
		fs.readFile('./.env', (err, data) => {
			let env;
			if (err) {
				env = '';
			} else {
				env = data.toString();
			}
			// console.log('ENV', env);
			if (env.indexOf('BUILD_HASH') !== -1) {
				// console.log('contains hash, replace');
				env = env.replace(/BUILD_HASH=.*\n/, 'BUILD_HASH=' + hash + '\n');
			} else {
				// console.log('does not contain hash, add');
				env += 'BUILD_HASH=' + hash + '\n';
			}
			// console.log('env.split(\'\n\')', env);
			fs.writeFile('./.env', env, (err) => {
				if (err) throw err;
				console.log('# > ENV > .env file was created');
				if (done) done();
			});
		});
	});
}

gulp.task('set-build-hash', (done) => {
	setBuildHashENV(done);
});

gulp.task('database', (done) => {
	if (mongo) mongo.kill();
	mongo = spawn('npm', ['run', 'mongo-start'], {stdio: 'inherit'});
	mongo.on('close', (code) => {
		if (code === 8) {
			console.log('Error detected, waiting for changes...');
		}
	});
	done();
});

gulp.task('server', (done) => {
	if (node) node.kill();
	node = spawn('node', ['server.js'], {stdio: 'inherit'});
	node.on('close', (code) => {
		if (code === 8) {
			console.log('Error detected, waiting for changes...');
		}
	});
	done();
});

gulp.task('tsc', (done) => {
	if (tsc) tsc.kill();
	tsc = spawn('npm', ['run', 'tsc'], {stdio: 'inherit'});
	tsc.on('error', (err) => {
		console.log('Error', err);
	});
	tsc.on('close', (code) => {
		if (code === 8) {
			console.log('Error detected, waiting for changes...');
		} else {
			done();
		}
	});
});

const logsIndexHTML = `
<!DOCTYPE html>
<html>
	<head>
		<style>
			body {
				height: 100%;
				margin: 0;
				padding: 0 1em;
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				align-items: flex-start;
				align-content: flex-start;
				justify-content: stretch;
			}
			.flex-100 {
				flex: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.flex-item {
				flex: 1 1 auto;
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				align-items: center;
				justify-content: center;
				border: 1px rgba(0, 0, 0, 0.3) dotted;
			}
		</style>
	</head>
	<body>
			<h1 class="flex-100">SPAMT Reports and Documentation Index</h1>

			<h2 class="flex-100">Reports</h2>

			<span class="flex-item">
				<h3 class="flex-100">Server Unit</h3>
				<a class="flex-item" href="unit/server/index.html" target=_blank>Spec</a>
			</span>

			<span class="flex-item">
				<h3 class="flex-100">Client Unit</h3>
				<a class="flex-item" href="unit/client/index.html" target=_blank>Spec</a>
				<a class="flex-item" href="coverage/html-report/index.html" target=_blank>Coverage</a>
			</span>

			<span class="flex-item">
				<h3 class="flex-100">Client E2E</h3>
				<a class="flex-item" href="e2e/report/index.html" target=_blank>Spec</a>
			</span>

			<h2 class="flex-100">Documentation</h2>

			<span class="flex-item">
				<h3 class="flex-100">Server</h3>
				<a class="flex-item" href="jsdoc/index.html" target=_blank>JSDoc</a>
			</span>

			<span class="flex-item">
				<h3 class="flex-100">Client</h3>
				<a class="flex-item" href="typedoc/index.html" target=_blank>TypeDoc</a>
			</span>
	</body>
</html>
`;
gulp.task('generate-logs-index', (done) => {
	fs.writeFile('./logs/index.html', logsIndexHTML, (err) => {
		if (err) throw err;
		console.log('# > LOGS index.html > was created');
		done();
	});
});

gulp.task('jsdoc-server', () => {
	const jsdoc = require('gulp-jsdoc3');
	const config = require('./jsdoc.json');
	const source = ['./server.js', './app/**/*.js'];
	return gulp.src(['README.md'].concat(source), {read: false})
		.pipe(jsdoc(config));
});

gulp.task('typedoc-client', () => {
	const typedoc = require('gulp-typedoc');
	const config = {
		// typescript options (see typescript docs)
		allowSyntheticDefaultImports: true,
		alwaysStrict: true,
		importHelpers: true,
		baseUrl: '.',
		paths: {
			'tslib': ['node_modules/tslib/tslib.d.ts'],
			'*': ['*']
		},
		emitDecoratorMetadata: true,
		esModuleInterop: true,
		experimentalDecorators: true,
		forceConsistentCasingInFileNames: true,
		module: 'commonjs',
		moduleResolution: 'node',
		noImplicitAny: false,
		removeComments: true,
		sourceMap: true,
		suppressImplicitAnyIndexErrors: true,
		target: 'es2017',
		typeRoots: ['./node_modules/@types'],
		types: ['node', 'jasmine', 'hammerjs', 'core-js', 'jquery'],
		// output options (see typedoc docs: http://typedoc.org/api/index.html)
		readme: './README.md',
		out: './logs/typedoc',
		json: './logs/typedoc/typedoc-output.json',
		// typedoc options (see typedoc docs: http://typedoc.org/api/index.html)
		name: 'SPAMT Client',
		theme: 'default',
		//plugins: [], // set to none to use no plugins, omit to use all
		includeDeclarations: false,
		ignoreCompilerErrors: true,
		version: true
	};
	return gulp.src(['public/app/**/*.ts'], {read: false})
		.pipe(typedoc(config));
});

gulp.task('server-test', () => {
	return gulp.src(['./test/server/*.js'], { read: false })
		.pipe(mocha({ reporter: 'good-mocha-html-reporter' })) // also spec reporter in terminal
		.on('error', util.log)
		.once('end', () => {
			if (fs.existsSync('./report.html')) {
				if (!fs.existsSync('./logs/unit/server')) {
					if (!fs.existsSync('./logs/unit')) {
						fs.mkdirSync('./logs/unit');
					}
					fs.mkdirSync('./logs/unit/server');
				}
				fs.copyFileSync('./report.html', './logs/unit/server/index.html');
				fs.unlinkSync('./report.html');
			}
		});
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

gulp.task('client-unit-test-single-run', (done) => {
	const server = new karmaServer({
		configFile: require('path').resolve('test/karma.conf.js'),
		singleRun: true
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
	/*
	*	this task builds angular application
	*	components, angular modules, and some dependencies
	*
	*	nonangular components related to design, styling, data visualization etc.
	*	are built by another task
	*/
	return systemjsBuilder('/','./systemjs.config.js')
		.buildStatic('app', 'bundle.min.js', {
			minify: true,
			mangle: true
		})
		.pipe(gulp.dest('./public/js'));
});

gulp.task('pack-vendor-js', () => {
	/*
	*	third party js files
	*/
	return gulp.src([
		// angular requirements
		'./node_modules/core-js/client/shim.js',
		'./node_modules/zone.js/dist/zone.min.js',
		'./node_modules/reflect-metadata/Reflect.js',
		'./node_modules/web-animations-js/web-animations.min.js',

		'./node_modules/jquery/dist/jquery.js',

		// ng2nvd3 dependency
		'./node_modules/d3/d3.js',
		'./node_modules/nvd3/build/nv.d3.js',

		'https://raw.githubusercontent.com/soundcloud/soundcloud-custom-player/master/js/soundcloud.player.api.js'
	])
		.pipe(plumber())
		.pipe(concat('vendor-bundle.js'))
		.pipe(uglify())
		.pipe(plumber.stop())
		.pipe(rename('vendor-bundle.min.js'))
		.pipe(gulp.dest('./public/js'));
});

gulp.task('pack-vendor-css', () => {
	/*
	*	third party css files
	*/
	return gulp.src([
		'./node_modules/nvd3/build/nv.d3.css',
		'./node_modules/components-font-awesome/css/fontawesome-all.css',
		/*
		*	Angular material theme should be chosen and loaded here
		*/
		'./node_modules/@angular/material/prebuilt-themes/deeppurple-amber.css'
		//'./node_modules/@angular/material/prebuilt-themes/indigo-pink.css'
		//'./node_modules/@angular/material/prebuilt-themes/pink-bluegrey.css'
		//'./node_modules/@angular/material/prebuilt-themes/purple-green.css'
	])
		.pipe(plumber())
		.pipe(concat('vendor-bundle.css'))
		.pipe(cssnano())
		.pipe(plumber.stop())
		.pipe(rename('vendor-bundle.min.css'))
		.pipe(gulp.dest('./public/css'));
});

gulp.task('move-vendor-fonts', () => {
	return gulp.src([
		'./node_modules/components-font-awesome/webfonts/*.*',
		// material design icons
		'./node_modules/material-design-icon-fonts/iconfont/*.eot',
		'./node_modules/material-design-icon-fonts/iconfont/*.woff2',
		'./node_modules/material-design-icon-fonts/iconfont/*.woff',
		'./node_modules/material-design-icon-fonts/iconfont/*.ttf'
	])
		.pipe(gulp.dest('./public/webfonts'));
});

gulp.task('sass-autoprefix-minify-css', () => {
	return gulp.src('./public/app/scss/*.scss')
		.pipe(plumber())
		.pipe(concat('packed-app.css'))
		.pipe(sass().on('error', sass.logError))
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

gulp.task('watch', () => {
	gulp.watch(['./server.js', './app/**/*.js'], ['database', 'server']);
	gulp.watch(['./test/server/*.js'], ['server-test']);
	gulp.watch(['./gulpfile.js'], ['pack-vendor-js', 'pack-vendor-css', 'move-vendor-fonts']);
	gulp.watch('./public/app/scss/*.scss', ['sass-autoprefix-minify-css']);
	gulp.watch(['./public/app/*.ts', './public/app/**/*.ts', './test/client/**/*.ts', './tslint.json'], ['spawn-rebuild-app']);
	gulp.watch(['./app/**', './public/js/*.js', './*.js', './.eslintignore', './.eslintrc.json'], ['eslint']);
});

gulp.task('watch-and-lint', () => {
	gulp.watch(['./app/**', './public/js/*.js', './*.js', './.eslintignore', './.eslintrc.json'], ['eslint']); // watch js files to be linted or eslint config and lint on change
	gulp.watch(['./public/app/*.ts', './public/app/**/*.ts', './test/client/**/*.ts', './tslint.json'], ['tslint']); // watch ts files to be linted or tslint config and lint on change
});

gulp.task('watch-client-and-test', () => {
	gulp.watch(['./public/app/*.ts', './public/app/**/*.ts', './test/client/**/*.ts', './test/karma.conf.js','./test/karma.test-shim.js'], ['compile-and-test']);
});

gulp.task('build', (done) => {
	runSequence('build-system-js', 'pack-vendor-js', 'pack-vendor-css', 'move-vendor-fonts', 'sass-autoprefix-minify-css', 'hashsum', 'set-build-hash', done);
});

gulp.task('compile-and-build', (done) => {
	runSequence('tsc', 'build', done);
});

gulp.task('compile-and-test', (done) => {
	runSequence('tsc', 'client-unit-test', done);
});

gulp.task('rebuild-app', (done) => {
	runSequence('tslint', 'tsc', 'build-system-js', 'hashsum', 'set-build-hash', done);
});

let rebuildApp;
gulp.task('spawn-rebuild-app', (done) => {
	if (rebuildApp) rebuildApp.kill();
	rebuildApp = spawn('gulp', ['rebuild-app'], {stdio: 'inherit'});
	rebuildApp.on('close', (code) => {
		console.log(`rebuildApp closed with code ${code}`);
	});
	done();
});

gulp.task('lint', (done) => {
	runSequence('eslint', 'tslint', done);
});

gulp.task('default', (done) => {
	runSequence('lint', 'compile-and-build', 'database', 'server', 'watch', done);
});

gulp.task('start-prebuilt', (done) => {
	runSequence('database', 'server', 'watch', done);
});

gulp.task('kill', (done) => {
	killProcessByName('gulp');
	done();
});

process.on('exit', (code) => {
	console.log(`PROCESS EXIT CODE ${code}`);
});
