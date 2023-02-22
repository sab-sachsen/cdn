export type Log = {
  debug: (format: any, ...args: any[]) => void;
  info: (format: any, ...args: any[]) => void;
  error: (format: any, ...args: any[]) => void;
};
