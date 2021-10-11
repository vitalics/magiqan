import chalk = require('chalk');
import log = require('loglevel');
import prefix = require('loglevel-plugin-prefix');
import type { LogLevelDesc } from 'loglevel';

import type { Logger } from '@magiqan/types';



const colors = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.blue,
  WARN: chalk.yellow,
  ERROR: chalk.red,
};

prefix.reg(log);
log.enableAll();


const loggers = log.getLoggers();

export default function logger(name: string, level: LogLevelDesc = 'info'): Logger {
  if (loggers[name]) {
    return loggers[name];
  }
  loggers[name] = log.getLogger(name);
  loggers[name].setLevel(level);

  prefix.apply(loggers[name], {
    format(level, name, timestamp) {
      const message = colors[level as keyof typeof colors](level)
      return `${chalk.gray(`[${timestamp}]`)} ${message} ${chalk.green(`${name}:`)}`;
    },
  });

  return loggers[name];
}
