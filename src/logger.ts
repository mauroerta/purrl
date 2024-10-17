import { createConsola } from "consola";
import { name } from "../package.json";
import chalk from "chalk";

const baseLogger = createConsola({
  defaults: {
    message: chalk.bgGreen(chalk.white(`[${name}]`)),
  },
  formatOptions: {
    colors: true,
  },
});

export const logger = {
  ...baseLogger,
  info(...args: Parameters<(typeof baseLogger)["debug"]>) {
    return baseLogger.info(chalk.cyan(...args));
  },
  debug(...args: Parameters<(typeof baseLogger)["debug"]>) {
    return baseLogger.debug(chalk.cyan(...args));
  },
  success(...args: Parameters<(typeof baseLogger)["debug"]>) {
    return baseLogger.success(chalk.green(...args));
  },
};
