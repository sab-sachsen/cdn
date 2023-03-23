import { format as logFormat } from 'node:util';
import type { NextFunction, Request, Response } from 'express';

import type { Log } from '../types/log.types';

const enableDebugging = process.env.NODE_ENV === 'development';

function createLog(): Log {
  return {
    debug: enableDebugging
      ? (format: any, ...args: any[]) => {
          console.log(logFormat(format, ...args));
        }
      : () => undefined,
    info: (format: any, ...args: any[]) => {
      console.log(logFormat(format, ...args));
    },
    error: (format: any, ...args: any[]) => {
      console.error(logFormat(format, ...args));
    }
  };
}

export default function requestLog(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.log = createLog();
  next();
}
