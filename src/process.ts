import path from 'path';
import fs from 'fs-extra';

import Parser from './parser';
import generateHTML from './html';

/**
 * Create a HTML file from a .txt or .md file
 * @param fileName File to be parsed
 * @return File path, undefined if file type is not supported
 */
const generateFile = (
  filePath: string,
  root: string,
  output: string,
  recursive: boolean,
  relative: boolean,
  lang: string,
  indexCSSPath: string
): string | undefined => {
  const { dir, name, ext } = path.parse(filePath);
  if (ext !== '.txt' && ext !== '.md') {
    return undefined;
  }
  const isMd = ext === '.md';
  const text = fs.readFileSync(filePath, 'utf-8');
  const parser = new Parser(text);
  const { title, content } = isMd ? parser.parseMD() : parser.parseTxt();
  const relativePathToRoot = relative
    ? `${path.relative(path.dirname(filePath), root) || '.'}/`
    : './';

  const markup = generateHTML(
    content,
    title ?? path.parse(filePath).name,
    !isMd,
    lang,
    `${relativePathToRoot}${indexCSSPath}`,
    `${relativePathToRoot}index.html`
  );

  const relativeFolder = path.relative(root, dir);
  const relativePath = relative && relativeFolder ? `/${relativeFolder}/` : '/';
  const file = `${output}${relativePath}${name}.html`;

  fs.ensureFile(file).then(() => {
    fs.writeFile(file, markup, { flag: 'w' });
    console.log(`Created '${file}'`);
  });
  return file;
};

/**
 * Search for .txt and .md file and generate HTML
 * @param pathName Directory or file to be parsed
 * @return list of generated file paths
 * */
const findAndGenerateFiles = (
  root: string,
  output: string,
  recursive: boolean,
  relative: boolean,
  lang: string,
  indexCSSPath: string
): string[] => {
  // If path is a file, generate an HTML, if folder, expand the folder
  const generate = (filePath: string, generatedFiles: string[]): string[] => {
    try {
      const fileStat = fs.statSync(filePath);
      if (fileStat.isFile()) {
        const file = generateFile(filePath, root, output, recursive, relative, lang, indexCSSPath);
        if (file) {
          return generatedFiles.concat(file);
        }
        return generatedFiles;
      }
      if (fileStat.isDirectory()) {
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
  return generate(root, []);
};

export { generateFile, findAndGenerateFiles };
