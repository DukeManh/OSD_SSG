#!/usr/bin/env node

import * as yargs from 'yargs';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';

// Decorated console log
const logError = (message: string) => console.log(chalk.hex('#FF616D')(message));
const logSuccess = (message: string) => console.log(chalk.hex('#66DE93')(message));

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
    },
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
const { input, output, recursive, relative, stylesheet } = argv;

fs.removeSync(output);
fs.ensureDirSync(output);
fs.ensureFileSync(`${output}/index.css`);

if (stylesheet) {
  try {
    const file = fs.statSync(stylesheet);

    if (!file.isFile() || path.extname(stylesheet) !== '.css') {
      throw new Error(`'${stylesheet}' is not a css file`);
    }

    fs.copyFileSync(stylesheet, `${output}/index.css`);
  } catch (error) {
    fs.removeSync(output);
    logError('Error reading stylesheet');
    process.exit(1);
  }
} else {
  fs.copyFileSync('src/styles/index.css', `${output}/index.css`);
}

/**
 * Process markdown for heading 1-6
 * @param data Data to be processed
 * @return return array where h1 markdown is processed
 */
const processHeadingMarkdown = (data: string[]): string[] => {
  return data.map((text) => {
    return text.replace(/^\s*(#{1,6})\s+(.+)$/gm, (match, hash, title) => {
      const tag = `h${hash.length}`;
      return `<${tag}>${title}</${tag}>`;
    });
  });
};

/**
 * Process markdown for P
 * @param data Data to be processed
 * @return return array where p markdown is processed
 */
const processPMarkdown = (data: string[]): string[] => {
  return data.map((text) => {
    if (text.substr(0, 1) !== '<' && text.substr(text.length - 1) !== '>') return `<p>${text}</p>`;
    return text;
  });
};

/**
 * Process markdown
 * It only support markdown for heading 1-6, and P
 * @param data Data to be processed
 * @return return array of HTML
 */
const processMarkdown = (data: string[]): string[] => {
  let treatedDataList: string[] = [];
  treatedDataList = processHeadingMarkdown(data);
  treatedDataList = processPMarkdown(treatedDataList);
  return treatedDataList;
};

/**
 * Generate HTML mark up from .txt file
 * @param fileName File to be parsed
 * @param isIndex If false, add `Back to home` link to index page
 * @return HTML markup, empty if file is invalid
 */
const processFile = (filePath: string, isIndex: boolean): string => {
  const extension = path.extname(filePath).toLowerCase();
  if (extension !== '.txt' && extension !== '.md') {
    return '';
  }

  const isMd = extension === '.md';
  const text = fs.readFileSync(filePath, 'utf-8');

  // title is before the first 2 blank lines of the text
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
                <link rel="stylesheet" href="${
                  path.relative(path.dirname(filePath), input) || './'
                }/index.css"> 
                <title>${title || path.parse(filePath).name}</title>`;

  const body = `
                ${
                  !isIndex
                    ? `<a class="backToHome" href="${
                        path.relative(path.dirname(filePath) || './', input) || './'
                      }/index.html">Back to home</a>`
                    : ''
                }
                ${title ? `<h1 class="text-center">${title}</h1>` : ''}
                
                ${
                  isMd
                    ? processMarkdown(
                        content.split(/\r?\n\r?\n/).map((para) => `${para.replace(/\r?\n/g, ' ')}`)
                      ).join('\n')
                    : content
                        .split(/\r?\n\r?\n/)
                        .map((para) => `<p>${para.replace(/\r?\n/, ' ')}</p>`)
                        .join('\n')
                }
                  `;

  const markup = `<!DOCTYPE html>
      <html lang="en">
        <head>
          ${head}
        </head>
        <body>
          ${body}
          <h6 class="text-center"> End </h6>
        </body>
      </html>`;

  logSuccess(`✅ ${filePath}`);
  return markup.split(/\n\s+/).join('\n');
};

/**
 * Generate HTML file for each .txt encountered
 * @param pathName Directory or file to be parsed
 * @return list of generated file paths
 * */
const generateHTMLs = (pathName: string): string[] => {
  // If path is a file, generate an HTML, if folder, expand the folder
  const generate = (filePath: string, dists: string[]): string[] => {
    try {
      const fileStat = fs.statSync(filePath);
      if (fileStat.isFile()) {
        const markup = processFile(filePath, false);
        if (markup) {
          const relativeFolder = relative ? `/${path.relative(input, path.dirname(filePath))}` : '';
          const dist = `${output}${relativeFolder}/${path.basename(
            filePath,
            path.extname(filePath)
          )}.html`;

          fs.ensureFileSync(dist);
          fs.writeFileSync(dist, markup, { flag: 'w' });
          return dists.concat(dist);
        }
        return dists;
      }
      if (fileStat.isDirectory()) {
        let files = fs.readdirSync(filePath, { withFileTypes: true });
        files = recursive ? files : files.filter((file) => file.isFile());

        return dists.concat(
          files
            .map((file) => generate(path.join(filePath, file.name), dists))
            .reduce((acc, curr) => [...acc, ...curr], [])
        );
      }

      return dists;
    } catch (err) {
      return dists;
    }
  };

  return generate(pathName, []);
};

let inputPath;
try {
  inputPath = fs.statSync(input);
} catch {
  logError(`${input}: No such file or directory`);
  fs.readdirSync(output);
  process.exit(1);
}

if (inputPath.isFile()) {
  const markup = processFile(input, true);
  if (!markup) {
    logError('Input file must be .txt or .md');
  }

  fs.writeFileSync(`${output}/${path.basename(input, path.extname(input))}.html`, markup, {
    flag: 'w',
  });
} else if (inputPath.isDirectory()) {
  const dists = generateHTMLs(input);

  const indexMarkup = `<!DOCTYPE html>
      <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="index.css"> 
        <title>${path.basename(input)}</title>
        </head>
        <body>
          <h1>${path.basename(input)}</h1>
          <ul>
            ${dists
              .map(
                (dist) =>
                  `<li><a href="${path.relative(output, dist)}">${path.basename(
                    dist,
                    '.html'
                  )}</a></li>`
              )
              .join('\n')}
          </ul>
        </body>
      </html>`
    .split(/\n\s+/)
    .join('\n');

  fs.writeFileSync(`${output}/index.html`, indexMarkup, { flag: 'w' });
} else {
  logError(`${input}: No such file or directory`);
  process.exit(1);
}
