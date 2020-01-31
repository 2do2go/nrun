#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { addArguments } = require('./helpers');
const { writeStdout, writeStderr, spawnCommand } = require('./utils');
const { name, scripts } = require(path.join(process.cwd(), 'package.json'));

async function exit(code) {
	await Promise.all([writeStdout(''), writeStderr('')]);
	process.exit(code);
}

async function runScripts(scripts) {
	for (const [index, { name, command }] of Object.entries(scripts)) {
		console.log('> nrun %s', name);
		console.log('> %s', command);

		await spawnCommand(command);

		if (index < scripts.length - 1) {
			console.log('');
		}
	}
}

const [, , scriptName, ...scriptArgs] = process.argv;

if (!scriptName) {
	console.log(`Scripts for "${name}":`);

	Object.entries(scripts).forEach(([name, script]) => {
		console.log(`  ${name}`);
		console.log(`    ${script}`);
	});

	return exit(0);
}

if (scriptName === '--completion') {
	console.log(
		fs.readFileSync(
			path.join(__dirname, 'completion.sh'),
			'utf8'
		)
	);

	return exit(0);
}

if (!scripts[scriptName]) {
	console.error(`Unknown script "${scriptName}" for package "${name}"`);
	return exit(1);
}

const scriptsToRun = ['pre', '', 'post']
	.filter((prefix) => scripts[prefix + scriptName])
	.map((prefix) => {
		const name = prefix + scriptName;
		const args = prefix ? [] : scriptArgs;

		return {
			name,
			command: addArguments(scripts[name], args)
		};
	});

runScripts(scriptsToRun)
	.then(exit)
	.catch(exit);
