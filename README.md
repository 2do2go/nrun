# nrun

[![Build Status](https://travis-ci.org/2do2go/nrun.svg?branch=master)](https://travis-ci.org/2do2go/nrun)

An alternative package.json scripts runner for node.js. `nrun` gets script from `package.json` and runs it using `spawn` and current
shell.

## Installation

```sh
$ npm install nrun
```

## Usage

Let's imagine there are follow scripts in `package.json`

```json
"scripts": {
  "lint": "eslint ./",
  "test": "jest"
}
```

Now you can run scripts like so:

```
$ nrun lint
$ nrun test --bail
$ nrun test --coverage --coverageReporters=text-lcov
```

Instead of
```
$ npm run lint
$ npm run test -- --bail
$ npm run test -- --coverage --coverageReporters=text-lcov
```

Also you can activate a completion. Just add the content of the `./bin/completion.sh` file to your `.bashrc`, or just run follow command:

```sh
$ nrun --completion >> ~/.bashrc
```
