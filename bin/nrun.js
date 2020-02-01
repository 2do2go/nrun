#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { addArguments } = require('./helpers');
const { writeStdout, writeStderr, spawnCommand } = require('./utils');

const {
  name: packageName,
  scripts: packageScripts,
} = require(path.join(process.cwd(), 'package.json'));


function getScriptsToRun(scriptName, scriptArgs) {
  return ['pre', '', 'post']
    .filter((prefix) => packageScripts[prefix + scriptName])
    .map((prefix) => {
      const name = prefix + scriptName;
      const args = prefix ? [] : scriptArgs;

      return {
        name,
        command: addArguments(packageScripts[name], args),
      };
    });
}

async function exit(code) {
  await Promise.all([writeStdout(''), writeStderr('')]);
  process.exit(code);
}

/* eslint-disable no-console */
async function runScripts(scripts) {
  // eslint-disable-next-line no-restricted-syntax
  for (const [index, { name, command }] of Object.entries(scripts)) {
    console.log('> nrun %s', name);
    console.log('> %s', command);

    await spawnCommand(command);

    if (index < scripts.length - 1) {
      console.log('');
    }
  }
}

async function validateArgs([, , scriptName, ...scriptArgs]) {
  if (!scriptName) {
    console.log(`Scripts for "${packageName}":`);
    Object.entries(packageScripts).forEach(([name, script]) => {
      console.log(`  ${name}`);
      console.log(`    ${script}`);
    });

    return exit(0);
  }

  if (scriptName === '--completion') {
    console.log(
      fs.readFileSync(
        path.join(__dirname, 'completion.sh'),
        'utf8',
      ),
    );

    return exit(0);
  }

  if (!packageScripts[scriptName]) {
    console.error(`Unknown script "${scriptName}" for package "${packageName}"`);
    return exit(1);
  }

  return { scriptName, scriptArgs };
}
/* eslint-enable */

validateArgs(process.argv)
  .then(({ scriptName, scriptArgs }) => runScripts(getScriptsToRun(scriptName, scriptArgs)))
  .then(exit)
  .catch(exit);
