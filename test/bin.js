'use strict';

var expect = require('expect.js'),
	Steppy = require('twostep').Steppy,
	childProcess = require('child_process'),
	fs = require('fs'),
	path = require('path'),
	os = require('os');

var completionShContent = fs.readFileSync(
	path.join(__dirname, '../bin/completion.sh'), 'utf8'
);

var isWin = process.platform.substring(0, 3) === 'win';

describe('Binary', function() {

	var binPath = isWin ? 'node bin/nrun' : 'bin/nrun';

	var exec = function() {
		var callback = arguments[arguments.length - 1];
		arguments[arguments.length - 1] = function(err, stdout, stderr) {
			callback(err, {stdout: stdout, stderr: stderr});
		};
		childProcess.exec.apply(childProcess.exec, arguments);
	};

	it('call without arguments should return list of scripts', function(done) {
		Steppy(
			function() {
				exec(binPath, this.slot());
			},
			function(err, binData) {
				expect(binData.stderr).not.ok();
				expect(binData.stdout).eql(
					[
						'Scripts for "nrun":',
						'  test',
						'    mocha test/ --bail --reporter spec',
						'  testLs',
						'    ls',
						'  testShowPath',
						'    echo $PATH',
						'  testShowPathWin',
						'    echo %PATH%',
						'  pretestEcho',
						'    echo prescript',
						'  testEcho',
						'    echo script',
						'  posttestEcho',
						'    echo postscript'
					].join('\n') + '\n'
				);
				this.pass(null);
			},
			done
		);
	});

	it('call with single arg calls target script', function(done) {
		Steppy(
			function() {
				exec(binPath + ' testLs', this.slot());
				exec('ls', this.slot());
			},
			function(err, binData, lsData) {
				expect(binData.stderr).not.ok();
				expect(binData.stdout).eql(
					[
						'> nrun testLs',
						'> ls ',
						lsData.stdout
					].join('\n')
				);
				this.pass(null);
			},
			done
		);
	});

	it('should extend path with node_modules/.bin', function(done) {
		var script = isWin ? 'testShowPathWin' : 'testShowPath',
			cmd = isWin ? 'echo %PATH%' : 'echo $PATH';

		Steppy(
			function() {
				exec(binPath + ' ' + script, this.slot());
				exec(cmd, this.slot());
			},
			function(err, binData, cmdData) {
				expect(binData.stderr).not.ok();
				expect(binData.stdout).eql(
					[
						'> nrun ' + script,
						'> ' + cmd + ' ',
						cmdData.stdout.replace(
							new RegExp(os.EOL + '$'),
							(
								path.delimiter + path.resolve('node_modules', '.bin') +
								(isWin ? ' ' : '') + os.EOL
							)
						)
					].join('\n')
				);
				this.pass(null);
			},
			done
		);
	});

	it('call with more args calls target script args', function(done) {
		Steppy(
			function() {
				exec(binPath + ' testLs -l -h', this.slot());
				exec('ls -l -h', this.slot());
			},
			function(err, binData, lsData) {
				expect(binData.stderr).not.ok();
				expect(binData.stdout).eql(
					[
						'> nrun testLs',
						'> ls "-l" "-h"',
						lsData.stdout
					].join('\n')
				);
				this.pass(null);
			},
			done
		);
	});

	it('call script that has `pre` and `post` scripts', function(done) {
		Steppy(
			function() {
				exec(binPath + ' testEcho', this.slot());
				exec('echo prescript', this.slot());
			},
			function(err, binData, prescriptData) {
				this.pass(binData, prescriptData);

				exec('echo script', this.slot());
			},
			function(err, binData, prescriptData, scriptData) {
				this.pass(binData, prescriptData, scriptData);

				exec('echo postscript', this.slot());
			},
			function(err, binData, prescriptData, scriptData, postscriptData) {
				expect(binData.stderr).not.ok();
				expect(binData.stdout).eql(
					[
						'> nrun pretestEcho',
						'> echo prescript',
						prescriptData.stdout,

						'> nrun testEcho',
						'> echo script',
						scriptData.stdout,

						'> nrun posttestEcho',
						'> echo postscript',
						postscriptData.stdout,
					].join('\n')
				);
			},
			done
		);
	});

	it('call with unexisted script throw error to stderr', function(done) {
		exec(binPath + ' unexisted', function(err, binData) {
			expect(binData.stderr).ok();
			expect(binData.stderr).match(/Unknown script "unexisted"/);
			done();
		});
	});

	it('call with "--completion" option should return completion.sh content',
		function(done) {
			exec(binPath + ' --completion', function(err, binData) {
				expect(binData.stderr).not.ok();
				expect(binData.stdout).to.be(completionShContent + '\n');
				done();
			});
		}
	);
});
