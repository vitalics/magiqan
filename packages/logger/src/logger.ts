import chalk = require('chalk');
import log = require('loglevel');
import prefix = require('loglevel-plugin-prefix');
import type { Logger } from '@magiqan/types';
import { events } from '@magiqan/events';

import { LogEvent } from './event';

const colors: Record<Logger.LogLevel, chalk.Chalk> = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.blue,
  WARN: chalk.yellow,
  ERROR: chalk.red,
  SILENT: chalk.white,
};

prefix.reg(log);
log.enableAll();

const loggers = log.getLoggers();

/**
 * Logger function which get namespace and level
 * 
 * @see {@link https://www.npmjs.com/package/loglevel}
 *
 * @export
 * @param {string} namespace namespace of the current logger. Should be unique
 * @param {Logger.LogLevel} [level='INFO'] level, by default is `INFO`
 * @return {*}  {Logger.Logger}
 */
export default function logger(namespace: string, level: Logger.LogLevel = 'INFO'): Logger.Logger {
  if (loggers[namespace]) {
    return loggers[namespace];
  }
  loggers[namespace] = log.getLogger(namespace);
  loggers[namespace].setLevel(level);

  prefix.apply(loggers[namespace], {
    format(level, name, timestamp) {
      const message = colors[level as Logger.LogLevel](level);
      events.emit(new LogEvent({ namespace, message, timestamp, logger: loggers[namespace], level: level as Logger.LogLevel, args: [name] }));
      return `${chalk.gray(`${timestamp}`)} ${message} ${chalk.green(`${name}:`)}`;
    },
    timestampFormatter(date) {
      return `${chalk.gray(`[${date.toISOString()}]`)}`
    },
  });

  return loggers[namespace];
}
