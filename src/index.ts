import * as fs from 'fs-extra';
import * as path from 'path';

import argv from './argv';
import Parser from './parser';
import generateHTML from './html';
import { logError, logSuccess } from './utilities';

const { input, output, recursive, stylesheet, relative, lang } = argv;

const indexCSSPath = 'styles/index.css';

const prepare = () => {
  fs.removeSync(output);
  fs.ensureDirSync(output);

  fs.ensureFile(`${output}/${indexCSSPath}`).then(() => {
    fs.copyFile(stylesheet, `${output}/${indexCSSPath}`);
  });
};

/**
 * Create HTML file from a .txt or .md file
 * @param fileName File to be parsed
 * @return File path, undefined if file type is not supported
 */
const parseFile = (filePath: string): string | undefined => {
  const { dir, name, ext } = path.parse(filePath);
  if (ext !== '.txt' && ext !== '.md') {
    return undefined;
  }

  const isMd = ext === '.md';

  const text = fs.readFileSync(filePath, 'utf-8');
  const parser = new Parser(text);
  const { title, content } = isMd ? parser.parseMarkdown() : parser.parseTxt();

  const relativePathToRoot = relative
    ? `${path.relative(path.dirname(filePath), input) || '.'}/`
    : './';

  const markup = generateHTML(
    content,
    title ?? path.parse(filePath).name,
    !isMd,
    lang,
    `${relativePathToRoot}${indexCSSPath}`,
    `${relativePathToRoot}index.html`
  );

  const relativeFolder = path.relative(input, dir);
  const relativePath = relative && relativeFolder ? `/${relativeFolder}/` : '/';
  const file = `${output}${relativePath}${name}.html`;

  fs.ensureFile(file).then(() => {
    fs.writeFile(file, markup, { flag: 'w' });
    logSuccess(file);
  });
  return file;
};

/**
 * Generate HTML file for each .txt and .md found
 * @param pathName Directory or file to be parsed
 * @return list of generated file paths
 * */
const generateFiles = (pathName: string): string[] => {
  // If path is a file, generate an HTML, if folder, expand the folder
  const generate = (filePath: string, generatedFiles: string[]): string[] => {
    try {
      const fileStat = fs.statSync(filePath);
      if (fileStat.isFile()) {
        const file = parseFile(filePath);
        if (file) {
          return generatedFiles.concat(file);
        }
        return generatedFiles;
      }
      else if (fileStat.isDirectory()) {
        let files = fs.readdirSync(filePath, { withFileTypes: true });
        files = recursive ? files : files.filter((file) => file.isFile());

        return generatedFiles.concat(
          files
            .map((file) => generate(path.join(filePath, file.name), generatedFiles))
            .reduce((acc, curr) => [...acc, ...curr], [])
        );
      }
      return generatedFiles;
    } catch {
      return generatedFiles;
    }
  };
  return generate(pathName, []);
};


const main = () => {
  prepare();
  try {
    const fileStat = fs.statSync(input);
    if (fileStat.isFile() || fileStat.isDirectory()) {
      const fileList = generateFiles(input);

      const menu = `<ul>${fileList.map((file) => `<li><a href="${path.relative(output, file)}">${path.parse(file).name}</a></li>`).join('\n')} </ul>`;

      const indexMarkup = generateHTML(menu, path.basename(input), true, lang, indexCSSPath);
      fs.writeFile(`${output}/index.html`, indexMarkup, { flag: 'w' }, (error) => {
        if (error) {
          logError(`Unable to write index HTML to ${output}/index.html`);
          console.error(error);
        }
      });
    } else {
      throw new Error();
    }
  } catch {
    logError(`${input}: No such file or directory`);
    process.exit(1);
  }
}

main();