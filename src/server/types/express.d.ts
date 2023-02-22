import type { Entry } from './entry.type';
import type { Log } from './log.types';
import type { Package } from './package.type';

export {};

declare global {
  namespace Express {
    export interface Request extends Package {
      entry: Entry;
      log: Log;
    }
  }
}
