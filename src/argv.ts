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

export const DefaultArgs = {
  output: 'build',
  recursive: false,
  relative: false,
  stylesheet: path.resolve(__dirname, '../assets/styles/index.css'),
  lang: 'en-CA',
};

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
        default: DefaultArgs.output,
      },
      recursive: {
        alias: 'r',
        describe: 'Recursively parsed files',
        type: 'boolean',
        default: DefaultArgs.recursive,
      },
      relative: {
        alias: 'e',
        describe: 'Maintain relative folder of files',
        type: 'boolean',
        default: DefaultArgs.relative,
      },
      stylesheet: {
        alias: 's',
        describe: 'Custom stylesheet',
        type: 'string',
        requiresArg: true,
        default: DefaultArgs.stylesheet,
      },
      lang: {
        alias: 'l',
        describe: 'HTML language code',
        type: 'string',
        requiresArg: true,
        default: DefaultArgs.lang,
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
