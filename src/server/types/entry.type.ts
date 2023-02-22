import type { Headers } from 'tar-stream';

export type Entry = {
  path: string;
  name?: string;
  type: Headers['type'];
  content?: Buffer;
  contentType?: string;
  integrity?: string;
  lastModified?: string;
  size?: number;
  files?: Entry[];
};
