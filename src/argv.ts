import yargs from 'yargs';
import fs from 'fs-extra';
import path from 'path';

export interface ARGV {
  input: string;
  output: string;
  recursive: boolean;
  relative: boolean;
  stylesheet: string;
  lang: string;
  _: (string | number)[];
  $0: string;
}

const argv = (args: string[] = process.argv.slice(2)): ARGV =>
  yargs(args)
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
        default: 'build',
      },
      recursive: {
        alias: 'r',
        describe: 'Recursively parsed files',
        type: 'boolean',
        default: false,
      },
      relative: {
        alias: 'e',
        describe: 'Maintain relative folder of files',
        type: 'boolean',
        default: false,
      },
      stylesheet: {
        alias: 's',
        describe: 'Custom stylesheet',
        type: 'string',
        requiresArg: true,
        default: path.join(__dirname, 'styles/index.css'),
      },
      lang: {
        alias: 'l',
        describe: 'HTML language code',
        type: 'string',
        requiresArg: true,
        default: 'en-CA',
      },
    })
    .check(({ lang, stylesheet }) => {
      if (lang) {
        const htmlLang = /^[a-zA-Z]{2,3}(?:-[a-zA-Z]{2,3})*$/gm;

        if (!htmlLang.test(lang)) {
          throw new Error('Unsupported HTML language');
        }
      }
      if (stylesheet) {
        const file = fs.statSync(stylesheet);
        if (!file.isFile() || path.extname(stylesheet) !== '.css') {
          throw new Error(`'${stylesheet}' is not a css file`);
        }
      }
      return true;
    })
    .strict()
    .fail((msg, error) => {
      console.error(error?.message || msg);
      process.exit(1);
    })
    .config()
    .alias('config', 'c')
    .help()
    .alias('help', 'h')
    .version()
    .alias('version', 'v').argv as ARGV;

export default argv;
