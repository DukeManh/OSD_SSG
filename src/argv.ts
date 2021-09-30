import * as yargs from 'yargs';
import fs from 'fs-extra';
import path from 'path';

import { logError } from './utilities';

const argv = yargs
  .option({
    input: {
      alias: 'i',
      describe: 'File or folder to be parsed',
      type: 'string',
      demandOption: true,
      requiresArg: true,
    },
    output: {
      alias: 'o',
      describe: 'Output folder for generated files',
      type: 'string',
      requiresArg: true,
      default: 'dist',
    },
    recursive: {
      alias: 'r',
      describe: 'Recursively parsed files',
      type: 'boolean',
    },
    relative: {
      alias: 'e',
      describe: 'Maintain relative folder of files',
      type: 'boolean',
    },
    stylesheet: {
      alias: 's',
      describe: 'Custom stylesheet',
      type: 'string',
      requiresArg: true,
      default: 'src/styles/index.css',
    },
  })
  .check(({ stylesheet }) => {
    if (stylesheet) {
      const file = fs.statSync(stylesheet);
      if (!file.isFile() || path.extname(stylesheet) !== '.css') {
        throw new Error(`'${stylesheet}' is not a css file`);
      }
    }
    return true;
  })
  .strict()
  .fail((msg, error, args) => {
    console.log(args.help());
    logError(error?.message || msg);
    process.exit(9);
  })
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v').argv as {
  input: string;
  output: string;
  recursive: boolean;
  relative: boolean;
  stylesheet: string;
  _: (string | number)[];
  $0: string;
};

export default argv;
