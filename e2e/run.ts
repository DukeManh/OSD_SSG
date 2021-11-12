// eslint-disable-next-line import/no-extraneous-dependencies
import execa from 'execa';

async function run(...args: string[]): Promise<execa.ExecaReturnValue<string>> {
  try {
    const result = await execa.command(`node lib/src/index.js ${args.join(' ')}`);
    return result;
  } catch (error) {
    return error as execa.ExecaReturnValue<string>;
  }
}

async function build(): Promise<void> {
  await execa.command('npm run build');
}

export { build };
export default run;
