import * as fs from 'fs-extra';
import * as path from 'path';

import argv from './argv';
import { processMarkdown, processTxt } from './processFile';
import generateHTML from './generateHTML';
import { logError, logSuccess } from './utilities';

const { input, output, recursive, stylesheet, relative, lang } = argv;

const indexCSS = 'styles/index.css';

fs.removeSync(output);
fs.ensureDirSync(output);

fs.ensureFile(`${output}/${indexCSS}`).then(() => {
  fs.copyFile(stylesheet, `${output}/${indexCSS}`);
});

/**
 * Generate HTML markup file from a .txt or .md file
 * @param fileName File to be parsed
 * @return HTML markup, empty if file type is not supported
 */
const processFile = (filePath: string): string => {
  const extension = path.extname(filePath).toLowerCase();
  if (extension !== '.txt' && extension !== '.md') {
    return '';
  }

  const isMd = extension === '.md';
  const text = fs.readFileSync(filePath, 'utf-8');
  const { title, content } = isMd ? processMarkdown(text) : processTxt(text);

  const relativePathToRoot = relative
    ? `${path.relative(path.dirname(filePath), input) || '.'}/`
    : './';

  const markup = generateHTML(
    content,
    title ?? path.parse(filePath).name,
    !isMd,
    lang,
    `${relativePathToRoot}${indexCSS}`,
    `${relativePathToRoot}index.html`
  );

  return markup;
};

/**
 * Generate HTML file for each .txt and .md found
 * @param pathName Directory or file to be parsed
 * @return list of generated file paths
 * */
const generateFiles = (pathName: string): string[] => {
  // If path is a file, generate an HTML, if folder, expand the folder
  const generate = (filePath: string, fileList: string[]): string[] => {
    try {
      const fileStat = fs.statSync(filePath);
      if (fileStat.isFile()) {
        const markup = processFile(filePath);
        if (markup) {
          const { dir, name } = path.parse(filePath);

          const relativeFolder = path.relative(input, dir);
          const relativePath = relative && relativeFolder ? `/${relativeFolder}/` : '/';
          const file = `${output}${relativePath}${name}.html`;
          logSuccess(file);

          fs.ensureFile(file).then(() => {
            fs.writeFile(file, markup, { flag: 'w' });
          });
          return fileList.concat(file);
        }
        return fileList;
      }
      if (fileStat.isDirectory()) {
        let files = fs.readdirSync(filePath, { withFileTypes: true });
        files = recursive ? files : files.filter((file) => file.isFile());

        return fileList.concat(
          files
            .map((file) => generate(path.join(filePath, file.name), fileList))
            .reduce((acc, curr) => [...acc, ...curr], [])
        );
      }
      return fileList;
    } catch {
      return fileList;
    }
  };

  return generate(pathName, []);
};

let inputPath;

try {
  inputPath = fs.statSync(input);
  if (inputPath.isFile() || inputPath.isDirectory()) {
    const fileList = generateFiles(input);

    const menu = `<ul>
              ${fileList
                .map(
                  (file) =>
                    `<li><a href="${path.relative(output, file)}">${path.parse(file).name}</a></li>`
                )
                .join('\n')}
                </ul>`;

    const indexMarkup = generateHTML(menu, path.basename(input), true, lang, indexCSS);
    fs.writeFile(`${output}/index.html`, indexMarkup, { flag: 'w' });
  } else {
    throw new Error();
  }
} catch {
  logError(`${input}: No such file or directory`);
  process.exit(1);
}
