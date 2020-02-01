const os = require('os');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const readFile = util.promisify(require('fs').readFile);
const { isWin } = require('../bin/helpers');

const binPath = isWin ? 'node bin/nrun.js' : 'bin/nrun.js';
const completionFile = path.join(__dirname, '../bin/completion.sh');

// Removes
// '> nrun <command name>'
// '> <command>'
const getCleanCommandResult = (str) => str.split('\n').slice(2).join('\n');

test('Call without arguments should return list of scripts', async () => {
  const { stdout, stderr } = await exec(binPath);

  expect(stdout).toMatchSnapshot();
  expect(stderr).toMatchSnapshot();
});

test('Call with "--completion" option should return completion.sh content', async () => {
  const { stdout, stderr } = await exec(`${binPath} --completion`);
  const completionShContent = await readFile(completionFile, 'utf8');

  expect(stderr).toBeFalsy();
  expect(stdout.trim()).toEqual(completionShContent.trim());
});

test('Сall with unexisted script throw error to stderr', async () => {
  const unexisted = exec(`${binPath} unexisted`);
  await expect(unexisted).rejects.toThrow('Unknown script "unexisted"');
});

test('Call with single arg calls target script', async () => {
  const { stdout, stderr } = await exec(`${binPath} testLs`);
  const { stdout: lsStdout } = await exec('ls');

  expect(stdout).toMatchSnapshot();
  expect(stderr).toMatchSnapshot();
  expect(getCleanCommandResult(stdout)).toEqual(lsStdout);
});

test('Call with more args calls target script args', async () => {
  const { stdout, stderr } = await exec(`${binPath} testLs -w 15 -m`);
  const { stdout: lsStdout } = await exec('ls -w 15 -m');

  expect(stdout).toMatchSnapshot();
  expect(stderr).toMatchSnapshot();
  expect(getCleanCommandResult(stdout)).toEqual(lsStdout);
});

test('Call script that has `pre` and `post` scripts', async () => {
  const { stdout, stderr } = await exec(`${binPath} testEcho`);

  expect(stdout).toMatchSnapshot();
  expect(stderr).toMatchSnapshot();
});

test('Should extend path with node_modules/.bin', async () => {
  const script = isWin ? 'testShowPathWin' : 'testShowPath';
  const cmd = isWin ? 'echo %PATH%' : 'echo $PATH';
  const pathToBin = [
    path.delimiter,
    path.resolve('node_modules', '.bin'),
    (isWin ? ' ' : ''),
    os.EOL,
  ].join('');

  const { stdout, stderr } = await exec(`${binPath} ${script}`);
  const { stdout: cmdStdout } = await exec(cmd);

  expect(stderr).toBeFalsy();
  expect(getCleanCommandResult(stdout)).toEqual(
    cmdStdout.replace(new RegExp(`${os.EOL}$`), pathToBin),
  );
});
