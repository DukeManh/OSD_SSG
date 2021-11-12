import run, { build } from './run';

function sortConsoleLogs(out: string) {
  const messages = out.split(/\r?\n/).sort();
  return messages.join('\n');
}

describe('end to end test', () => {
  beforeAll(async () => {
    try {
      await build();
    } catch {
      process.exit(1);
    }
  }, 15000);
  test('no input file path given', async () => {
    const { stderr, stdout, exitCode } = await run('');
    expect(sortConsoleLogs(stderr)).toMatchSnapshot();
    expect(exitCode).toEqual(1);
    expect(stdout).toEqual('');
  });

  test('only set input file path', async () => {
    const { stderr, stdout, exitCode } = await run('-i assets/text');
    expect(stderr).toEqual('');
    expect(exitCode).toEqual(0);
    expect(sortConsoleLogs(stdout)).toMatchSnapshot();
  });

  test('use relative option', async () => {
    const { stderr, stdout, exitCode } = await run('-i assets/text -e');
    expect(stderr).toEqual('');
    expect(exitCode).toEqual(0);
    expect(sortConsoleLogs(stdout)).toMatchSnapshot();
  });

  test('use recursive option', async () => {
    const { stderr, stdout, exitCode } = await run('-i assets/text -r');
    expect(stderr).toEqual('');
    expect(exitCode).toEqual(0);
    expect(sortConsoleLogs(stdout)).toMatchSnapshot();
  });

  test('use both recursive and relative option', async () => {
    const { stderr, stdout, exitCode } = await run('-i assets/text -e -r');
    expect(stderr).toEqual('');
    expect(exitCode).toEqual(0);
    expect(sortConsoleLogs(stdout)).toMatchSnapshot();
  });

  test('use config file', async () => {
    const { stderr, stdout, exitCode } = await run('-c assets/config/config.json');
    expect(stderr).toEqual('');
    expect(exitCode).toEqual(0);
    expect(sortConsoleLogs(stdout)).toMatchSnapshot();
  });

  test('use invalid css file', async () => {
    const { stderr, stdout, exitCode } = await run('-i assets/text -s src/index.ts');
    expect(stderr).toMatchSnapshot();
    expect(exitCode).toEqual(1);
    expect(stdout).toEqual('');
  });

  test('use invalid language ', async () => {
    const { stderr, stdout, exitCode } = await run('-i assets/text -l alien-lang');
    expect(stderr).toMatchSnapshot();
    expect(exitCode).toEqual(1);
    expect(stdout).toEqual('');
  });
});
