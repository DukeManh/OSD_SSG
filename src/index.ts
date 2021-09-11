#!/usr/bin/env node

import * as yargs from 'yargs';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';

// Decorated console output
const logError = (message: string) => console.error(chalk`{red Error: ${message}}`);
const logSuccess = (message: string) => console.error(chalk`{blue ${message}}`);

// Generate html text from .txt file
const processFile = (filePath: string, isIndex: boolean): string => {
  const extension = path.extname(filePath).toLowerCase();

  if (extension !== '.txt') {
    logError('Input file must be .txt');
    return '';
  }

  const text = fs.readFileSync(filePath, 'utf-8');

  const titleAndContent = text.split(/\n\n\n/);

  let title = '';
  let content = '';

  if (titleAndContent.length >= 2) {
    [title] = titleAndContent;
    content = titleAndContent.slice(1).join('\n\n\n');
  } else {
    [content] = titleAndContent;
  }

  const head = `<meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>`;

  const body = `
                ${!isIndex && `<a href="index.html">Back to home</a>`}
                <h1>${title}</h1><br>
                ${content
                  .split(/\n/)
                  .map((line) => `<p>${line || '<br>'}</p>\n`)
                  .join('')}

                  `;

  const markup = `<!DOCTYPE html>
      <html lang="en">
        <head>
          ${head}
        </head>
        <body>
          ${body}
        </body>
      </html>`;

  logSuccess(`✅ ${filePath}`);

  return markup.split(/\n\s+/).join('\n');
};

const argv = yargs
  .option({
    input: {
      alias: 'i',
      describe: 'File or folder to be parsed',
      type: 'string',
      demandOption: true,
      requiresArg: true,
    },
    dist: {
      alias: 'd',
      describe: 'Output folder of generated files',
      type: 'string',
      requiresArg: true,
    },
    recursive: {
      alias: 'a',
      describe: 'Recursively parsed files',
      type: 'boolean',
      requiresArg: true,
    },
  })
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v').argv as yargs.Arguments;

const { input, dist, recursive } = <
  {
    input: string;
    dist: string;
    recursive: boolean;
    _: (string | number)[];
    $0: string;
  }
>argv;

function generatedHTMLs(pathName: string, outputs: string[] = []): string[] {
  try {
    const fileStat = fs.statSync(pathName);

    if (fileStat.isFile()) {
      const markup = processFile(pathName, false);

      if (markup) {
        const output = `${path.basename(pathName, '.txt')}.html`;
        fs.writeFileSync(`./dist/${output}`, markup, { flag: 'w' });
        return outputs.concat(output);
      }
      return outputs;
    }
    if (fileStat.isDirectory()) {
      const files = fs.readdirSync(pathName);

      return outputs.concat(
        files
          .map((name) => generatedHTMLs(path.join(pathName, name)))
          .reduce((acc, curr) => [...acc, ...curr], [])
      );
    }

    return outputs;
  } catch (err) {
    return outputs;
  }
}

const inputPath = fs.statSync(input);

if (inputPath.isFile()) {
  const body = processFile(input, true);

  fs.removeSync('./dist/');
  fs.ensureFileSync(`./dist/index.html`);

  fs.writeFileSync('./dist/index.html', body, { flag: 'w' });
} else if (inputPath.isDirectory()) {
  fs.removeSync('./dist/');
  fs.ensureDirSync(`./dist`);
  const outputs = generatedHTMLs(input);

  const indexMarkup = `<!DOCTYPE html>
      <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${path.basename(input)}</title>
        </head>
        <body>
          <ul>
            ${outputs
              .map((output) => `<li><a href="${output}">${path.basename(output, '.html')}</a></li>`)
              .join('\n')}
          </ul>
        </body>
      </html>`;

  fs.writeFileSync('./dist/index.html', indexMarkup, { flag: 'w' });
} else {
  logError('Error reading input path');
}
