import Parser from '../parser';

describe('test md parser', () => {
  test('empty string', () => {
    const parser = new Parser('');
    const { title, content } = parser.parseMD();

    expect(title).toBeUndefined();
    expect(content).toEqual('');
  });

  it('should parse title and content', () => {
    const heading = 'Hello world';
    const codeBlock = `\`\`\`js\n   console.log('Hello world'); \n \`\`\``;
    const md = `# ${heading}\n${codeBlock}`;
    const parser = new Parser(md);
    const { title, content } = parser.parseMD();

    expect(title).toEqual(heading.trim());
    expect(content).toEqual(parser.md.render(md));
  });

  it('select the first heading found', () => {
    const heading1 = 'Hello world';
    const heading2 = 'Hello world';
    const codeBlock = `\`\`\`js\n   console.log('Hello world'); \n \`\`\``;
    const md = `# ${heading1}\n${codeBlock}\n${heading2}`;
    const parser = new Parser(md);
    const { title, content } = parser.parseMD();

    expect(title).toEqual(heading1.trim());
    expect(content).toEqual(parser.md.render(md));
  });

  it('should find no h1 heading', () => {
    const subHeading = 'Hi world';
    const codeBlock = `\`\`\`js\n   console.log('Hello world'); \n \`\`\``;
    const md = `## ${subHeading}\n${codeBlock}`;
    const parser = new Parser(md);
    const { title, content } = parser.parseMD();

    expect(title).toBeUndefined();
    expect(content).toEqual(parser.md.render(md));
  });

  it('should trim title', () => {
    const heading = ' \n \n  Hello world  ';
    const codeBlock = `\`\`\`js\n   console.log('Hello world'); \n \`\`\``;
    const md = `# ${heading}\n${codeBlock}`;
    const parser = new Parser(md);
    const { title, content } = parser.parseMD();

    expect(title).toEqual(heading.trim());
    expect(content).toEqual(parser.md.render(md));
  });

  it('should parse unrecognized language code block', () => {
    const codeBlock = `\`\`\`\n   console.log('Hello world'); \n \`\`\``;
    const md = `${codeBlock}`;
    const parser = new Parser(md);
    const { content } = parser.parseMD();

    expect(content).toEqual(parser.md.render(md));
  });
});

describe('test txt parser', () => {
  it('empty string', () => {
    const parser = new Parser('');
    const { title, content } = parser.parseTxt();

    expect(title).toBeUndefined();
    expect(content).toEqual('');
  });

  it('should parse title and content', () => {
    const heading = 'Hello world';
    const para1 = 'Global warming is real';
    const para2 = 'We need to act';
    const text = `${heading}\n\n\n${para1}\n\n${para2}`;
    const parser = new Parser(text);
    const { title, content } = parser.parseTxt();

    expect(title).toEqual(heading);
    expect(content).toEqual(`<p>${para1}</p>\n<p>${para2}</p>`);
  });

  it('should find no title', () => {
    const para1 = 'Global warming is real';
    const para2 = 'We need to act';
    const text = `${para1}\n\n${para2}`;
    const parser = new Parser(text);
    const { title, content } = parser.parseTxt();

    expect(title).toBeUndefined();
    expect(content).toEqual(`<p>${para1}</p>\n<p>${para2}</p>`);
  });

  it('should trim title', () => {
    const heading = '\n\n\n    Hello world    ';
    const para1 = 'Global warming is real';
    const para2 = 'We need to act';
    const text = `${heading}\n\n\n${para1}\n\n${para2}`;
    const parser = new Parser(text);
    const { title, content } = parser.parseTxt();

    expect(title).toEqual(heading.trim());
    expect(content).toEqual(`<p>${para1}</p>\n<p>${para2}</p>`);
  });
});
