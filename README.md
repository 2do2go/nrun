# nrun

Alternative package.json scripts runner for node.js

You can use nrun to run your package.json scripts with direct arguments
passing (without `--`). E.g. run `test` with specific reporter:

```sh

nrun test --reporter dot

```

contrasting to ```npm run test -- --reporter dot```.

nrun get scripts from `package.json` and runs them using `spawn` and `bin/sh`.
