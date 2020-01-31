const { spawn } = require('child_process');
const { getSpawnParams } = require('./helpers');

const promisifyWrite = (stream) => (text) => new Promise(
  (resolve) => stream.write(text, resolve),
);

exports.writeStdout = promisifyWrite(process.stdout);
exports.writeStderr = promisifyWrite(process.stderr);

exports.spawnCommand = (command) => {
  const { shell, shellArgs, opts } = getSpawnParams(command);

  return new Promise((resolve, reject) => {
    spawn(shell, shellArgs, opts).on('close', (code) => {
      if (code) return reject(code);

      return resolve();
    });
  });
};
