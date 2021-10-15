export interface ParsedData {
  content: string;
  title: string | undefined;
}

class Parser {
  private rawText: string;

  constructor(text: string) {
    this.rawText = text;
  }

  parseMarkdown(): ParsedData {
    let content = '';
    let title: string | undefined;

    // Links could be either [name](href title) or [name](href)
    const links = new RegExp(/\[(.*?)\]\((.+?)(?:\s"(.*?)")?\)/, 'gm');
    content = this.rawText.replace(
      links,
      (match, p1, p2, p3) => `<a href="${p2}" ${p3 ? `title="${p3}"` : ''}>${p1}</a>`
    );

    const bold = new RegExp(/\*{2}(.+?)\*{2}/, 'gm');
    content = content.replace(bold, '<strong>$1</strong>');

    const italics = new RegExp(/\*{1}(.+?)\*{1}/, 'gm');
    content = content.replace(italics, '<i>$1</i>');

    content = content
      .split(/(?:\r?\n)+/)
      .map((paragraph) => {
        const headings = new RegExp(/^\s*(#{1,6})\s+(.+)$/, 'gm');
        if (headings.test(paragraph)) {
          return paragraph.replace(headings, (match, hash, heading) => {
            title = !(title === undefined) && hash.length === 1 ? heading : title;
            const tag = `h${hash.length}`;
            return `<${tag}>${heading}</${tag}>`;
          });
        }
        return `<p>${paragraph}</p>`;
      })
      .join('\n');

    return { content, title };
  }

  parseTxt(): ParsedData {
    let title: string | undefined;
    let content: string | undefined;

    const titleAndContent = this.rawText.split(/\n\n\n/);
    if (titleAndContent.length >= 2) {
      [title] = titleAndContent;
      content = titleAndContent.slice(1).join('\n\n\n');
    } else {
      [content] = titleAndContent;
    }

    content = content
      .split(/\r?\n\r?\n/)
      .map((para) => `${para.replace(/\r?\n/g, ' ')}`)
      .map((para) => `<p>${para}</p>`)
      .join('\n');

    return { title, content };
  }
}

export default Parser;
