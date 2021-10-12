import chalk = require('chalk');
import log = require('loglevel');
import prefix = require('loglevel-plugin-prefix');
import type { LogLevelDesc } from 'loglevel';
import type { Logger } from '@magiqan/types';
import { events } from '@magiqan/events';

import { LogEvent } from './event';

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

export default function logger(namespace: string, level: LogLevelDesc = 'info'): Logger {
  if (loggers[namespace]) {
    return loggers[namespace];
  }
  loggers[namespace] = log.getLogger(namespace);
  loggers[namespace].setLevel(level);

  prefix.apply(loggers[namespace], {
    format(level, name, timestamp) {
      const message = colors[level as keyof typeof colors](level);
      events.emit(new LogEvent({ namespace, message, timestamp }))
      return `${chalk.gray(`[${timestamp.toISOString()}]`)} ${message} ${chalk.green(`${name}:`)}`;
    },
  });

  return loggers[namespace];
}
