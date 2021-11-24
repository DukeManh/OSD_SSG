#!/usr/bin/env node

import * as fs from 'fs-extra';
import * as path from 'path';

import argv from './argv';
import generateHTML from './html';
import { findAndGenerateFiles } from './process';

const { input, output, recursive, stylesheet, relative, lang } = argv();

const indexCSSPath = 'styles/index.css';

/**
 * Ensure output folder is created or recreated if exists and
 * copy index CSS to output folder
 */
const prepare = () => {
  fs.removeSync(output);
  fs.ensureDirSync(output);

  fs.ensureFile(`${output}/${indexCSSPath}`).then(() => {
    fs.copyFile(stylesheet, `${output}/${indexCSSPath}`);
  });
};

const main = () => {
  prepare();
  try {
    const fileStat = fs.statSync(input);
    if (fileStat.isFile() || fileStat.isDirectory()) {
      const fileList = findAndGenerateFiles(input, output, recursive, relative, lang, indexCSSPath);

      const menu = `<ul>${fileList
        .map(
          (file) => `<li><a href="${path.relative(output, file)}">${path.parse(file).name}</a></li>`
        )
        .join('\n')} </ul>`;

      const indexMarkup = generateHTML(menu, path.basename(input), true, lang, indexCSSPath);
      fs.writeFile(`${output}/index.html`, indexMarkup, { flag: 'w' }, (error) => {
        if (error) {
          console.error(`Unable to write index HTML to ${output}/index.html`);
          console.error(error);
        }
      });
    } else {
      throw new Error();
    }
  } catch {
    console.error(`${input}: No such file or directory`);
    process.exit(1);
  }
};

main();
