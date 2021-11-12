import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

export interface ParsedData {
  content: string;
  title: string | undefined;
}

class Parser {
  public rawText: string;

  public md: MarkdownIt;

  constructor(text: string) {
    this.rawText = text.trim();
    this.md = MarkdownIt({
      highlight(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value;
          } catch (__) {}
        }

        return ''; // use external default escaping
      },
    });
  }

  parseMD(): ParsedData {
    let content = '';
    const h1 = /^\s*#\s+(.+)$/gm;
    const title = h1.exec(this.rawText)?.[1].trim();

    content = this.md.render(this.rawText);

    return { content, title };
  }

  parseTxt(): ParsedData {
    let title: string | undefined;
    let content: string | undefined;

    const titleAndContent = this.rawText.split(/\n\n\n/);
    if (titleAndContent.length >= 2) {
      title = titleAndContent[0].trim();
      content = titleAndContent.slice(1).join('\n\n\n');
    } else {
      [content] = titleAndContent;
    }

    content = content
      .split(/\r?\n\r?\n/)
      .map((para) => `${para.replace(/\r?\n/g, ' ')}`)
      .map((para) => (para ? `<p>${para}</p>` : ''))
      .join('\n');

    return { title, content };
  }
}

export default Parser;
