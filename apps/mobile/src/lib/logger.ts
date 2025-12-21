import {
  logger,
  consoleTransport,
  fileAsyncTransport,
} from 'react-native-logs';
import * as RNFS from 'react-native-fs';
import {LogConfig} from '../config';

// Color type matching react-native-logs expected values
type LogColor =
  | 'grey'
  | 'blueBright'
  | 'yellowBright'
  | 'redBright'
  | 'default'
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'greenBright'
  | 'magentaBright'
  | 'cyanBright'
  | 'whiteBright';

/**
 * Logger configuration using react-native-logs
 * Supports both console and file logging based on config
 */
const createLoggerConfig = () => {
  const transports: any[] = [];

  // Always add console transport if enabled
  if (LogConfig.enableConsole) {
    transports.push(consoleTransport);
  }

  // Add file transport for production builds
  if (LogConfig.enableFile) {
    transports.push(fileAsyncTransport);
  }

  const colors: Record<string, LogColor> = {
    debug: 'grey',
    info: 'blueBright',
    warn: 'yellowBright',
    error: 'redBright',
  };

  return {
    levels: {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    },
    severity: LogConfig.minLevel as 'debug' | 'info' | 'warn' | 'error',
    transport: transports.length > 0 ? transports : consoleTransport,
    transportOptions: {
      colors,
      // File transport options
      FS: RNFS,
      fileName: LogConfig.fileNamePattern,
    },
    async: true,
    dateFormat: 'time' as const,
    printLevel: true,
    printDate: true,
    fixedExtLvlLength: true,
  };
};

const log = logger.createLogger(createLoggerConfig());

// Namespaced loggers for different parts of the app
export const chatLog = log.extend('CHAT');
export const apiLog = log.extend('API');
export const uiLog = log.extend('UI');
export const stateLog = log.extend('STATE');

export {log as logger};