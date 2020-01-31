const path = require('path');

const isWin = process.platform.substring(0, 3) === 'win';

const getSpawnOpts = () => {
  const pathName = ['PATH', 'Path', 'path'].find((name) => process.env[name]);

  return {
    stdio: 'inherit',
    env: {
      ...process.env,
      [pathName]: [
        process.env[pathName],
        path.delimiter,
        path.resolve('node_modules', '.bin'),
      ].join(''),
    },
  };
};

const getSpawnParams = (command) => ({
  shell: process.env.SHELL || '/bin/sh',
  shellArgs: ['-c', command],
  opts: getSpawnOpts(),
});

const getSpawnParamsWin = (command) => ({
  shell: process.env.comspec || 'cmd',
  shellArgs: ['/s', '/c', `"${command}"`],
  opts: {
    ...getSpawnOpts(),
    windowsVerbatimArguments: true,
  },
});


const replaceArgs = (arg) => arg.replace(/"/g, '\\"');
const replaceArgsWin = (arg) => arg.replace(/(\\*)"/g, '$1$1\\"').replace(/(\\*)$/, '$1$1');
const argReplacer = isWin ? replaceArgsWin : replaceArgs;


exports.isWin = isWin;
exports.getSpawnParams = isWin ? getSpawnParamsWin : getSpawnParams;

exports.addArguments = (command, args) => {
  if (args.length) {
    const argsStr = args
      .map((arg) => `"${argReplacer(arg)}"`)
      .join(' ');

    return `${command} ${argsStr}`;
  }

  return command;
};
