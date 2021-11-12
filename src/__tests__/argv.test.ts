import argv from '../argv';

describe('test command line arguments', () => {
  beforeAll(() => {
    jest.spyOn(process, 'exit').mockImplementation((number) => {
      throw new Error(`process.exit: ${number}`);
    });
  });
  afterAll(() => {
    jest.spyOn(process, 'exit').mockRestore();
  });

  const parseArgs = (args: string[]) => {
    const argvs = argv(args);
    return {
      input: argvs.input,
      output: argvs.output,
      recursive: argvs.recursive,
      stylesheet: argvs.stylesheet,
      lang: argvs.lang,
      relative: argvs.relative,
    };
  };

  it('should demand input folder', () => {
    expect(() => parseArgs(['-o', 'dist'])).toThrow();
  });

  describe('test default options', () => {
    const defaultOptions = {
      input: 'assets',
      output: 'build',
      recursive: false,
      relative: false,
      stylesheet: 'src/styles/index.css',
      lang: 'en-CA',
    };
    test('no additional options', () => {
      expect(parseArgs(['-i', 'assets'])).toEqual(defaultOptions);
    });

    test('some additional options', () => {
      expect(parseArgs(['-i', 'assets', '-o', 'dist', '--relative', 'true'])).toEqual({
        ...defaultOptions,
        output: 'dist',
        relative: true,
      });
    });
  });

  it('should not accept invalid language', () => {
    expect(() => parseArgs(['-i', 'assets', '-l', 'alien-lang'])).toThrow();
  });

  it('should not accept invalid stylesheet', () => {
    expect(() => parseArgs(['-i', 'assets', '-s', 'src/nonexistent.css'])).toThrow();
    expect(() => parseArgs(['-i', 'assets', '-s', 'src/index.ts'])).toThrow();
  });
});
