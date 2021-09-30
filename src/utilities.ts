import chalk from 'chalk';

const logError = (message: string): void => console.log(chalk.hex('#FF616D')(`❗${message}`));
const logSuccess = (message: string): void => console.log(chalk.hex('#66DE93')(`✅ ${message}`));

export { logError, logSuccess };
