import prettier from 'prettier';
import { JSDOM } from 'jsdom';

import generateHTML from '../html';

describe('test HTML generator', () => {
  const content = '<p>Hello world</p>';
  const stylesheetHref = 'src/index.css';
  const homeHref = 'index.html';
  const language = 'en-US';
  const title = 'Test file';

  it('should generate default HTML', () => {
    const markup = generateHTML(content, '', false, language);

    const dom = new JSDOM(markup).window.document;

    expect(dom.title).toEqual('');

    expect(
      Array.from(dom.querySelectorAll('link[rel=stylesheet]')).some(
        (stylesheet) => stylesheet.getAttribute('href') === stylesheetHref
      )
    ).toEqual(false);

    const html = dom.querySelector('html');
    expect(html?.attributes.getNamedItem('lang')?.value).toEqual(language);

    const homeLink = dom.querySelectorAll('.backToHome');
    expect(homeLink.length).toEqual(0);
  });

  it('should generate HTML tags from options', () => {
    const markup = generateHTML(content, title, true, language, stylesheetHref, homeHref);

    const dom = new JSDOM(markup).window.document;

    expect(dom.title).toEqual(title);

    expect(
      Array.from(dom.querySelectorAll('link[rel=stylesheet]')).some(
        (stylesheet) => stylesheet.getAttribute('href') === stylesheetHref
      )
    ).toEqual(true);

    const html = dom.querySelector('html');
    expect(html?.attributes.getNamedItem('lang')?.value).toEqual(language);

    const homeLink = dom.querySelector('.backToHome');
    expect(homeLink?.attributes.getNamedItem('href')?.value).toEqual(homeHref);
  });

  it('should format HTML using with provided prettier options', () => {
    const prettierOption = {
      printWidth: 20,
      tabWidth: 8,
      parser: 'html',
    };
    const markup = generateHTML(
      content,
      title,
      false,
      'en-CA',
      undefined,
      undefined,
      prettierOption
    );
    expect(prettier.check(markup, prettierOption)).toEqual(true);
  });

  it('should format HTML using using default options', () => {
    const markup = generateHTML(content, 'Test file', false, 'en-CA');
    expect(prettier.check(markup, { parser: 'html' })).toEqual(true);
  });
});
