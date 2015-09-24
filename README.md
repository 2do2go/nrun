# nrun

Alternative package.json scripts runner for node.js

You can use nrun to run your package.json scripts with direct arguments
passing (without `--`). E.g. run `test` with specific reporter:

```sh

nrun test --reporter dot

```

contrasting to ```npm run test -- --reporter dot```.

nrun gets script from `package.json` and runs it using `spawn` and current
shell.


[![Build Status](https://travis-ci.org/2do2go/nrun.svg?branch=master)](https://travis-ci.org/2do2go/nrun)
