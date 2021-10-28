import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

const md = MarkdownIt({
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        }</code></pre>`;
      } catch (__) {}
    }

    return `<pre class="hljs"><code>${new MarkdownIt().utils.escapeHtml(str)}</code></pre>`;
  },
});

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
    const h1 = /^\s*#\s+(.+)$/gm;
    const title = h1.exec(this.rawText)?.[1];

    content = md.render(this.rawText);

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
