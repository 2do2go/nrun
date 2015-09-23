'use strict';

var expect = require('expect.js'),
	Steppy = require('twostep').Steppy,
	childProcess = require('child_process');

var isWin = process.platform.substring(0, 3) === 'win';

describe('Binary', function() {

	var binPath;
	if (!isWin) {
		binPath = 'bin/nrun';
	} else {
		binPath = 'node bin/nrun';
	}

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
						'  testls',
						'    ls'
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
				exec(binPath + ' testls', this.slot());
				exec('ls', this.slot());
			},
			function(err, binData, lsData) {
				expect(binData.stderr).not.ok();
				expect(binData.stdout).eql(
					[
						'> nrun testls',
						'> ls ',
						lsData.stdout
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
				exec(binPath + ' testls -l -h', this.slot());
				exec('ls -l -h', this.slot());
			},
			function(err, binData, lsData) {
				var escaped;
				if (isWin) {
					escaped = '> ls -l -h';
				} else {
					escaped = '> ls "-l" "-h"';
				}

				expect(binData.stderr).not.ok();
				expect(binData.stdout).eql(
					[
						'> nrun testls',
						escaped,
						lsData.stdout
					].join('\n')
				);
				this.pass(null);
			},
			done
		);
	});

	it('call with unexisted script throw error to stderr', function(done) {
		exec(binPath + ' unexisted', function(err, binData) {
			expect(err).ok();
			expect(err.message).match(/Unknown script: unexisted/);
			done();
		});
	});
});
