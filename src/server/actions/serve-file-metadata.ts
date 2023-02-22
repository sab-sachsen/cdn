import type { Request, Response } from 'express';
import tar from 'tar-stream';

import type { Entry } from '../types/entry.type';
import asyncHandler from '../utils/async-handler';
import bufferStream from '../utils/buffer-stream';
import getContentType from '../utils/get-content-type';
import getIntegrity from '../utils/get-integrity';
import { getPackage } from '../utils/npm';

async function findEntry(stream: NodeJS.ReadableStream, filename: string) {
  // filename = /some/file/name.js
  return new Promise((accept, reject) => {
    let foundEntry: Entry | null = null;

    stream
      .pipe(tar.extract())
      .on('error', reject)
      .on('entry', async (header, stream, next) => {
        const entry: Entry = {
          // Most packages have header names that look like `package/index.js`
          // so we shorten that to just `/index.js` here. A few packages use a
          // prefix other than `package/`. e.g. the firebase package uses the
          // `firebase_npm/` prefix. So we just strip the first dir name.
          path: header.name.replace(/^[^/]+\/?/, '/'),
          type: header.type
        };

        // Ignore non-files and files that don't match the name.
        if (entry.type !== 'file' || entry.path !== filename) {
          stream.resume();
          stream.on('end', next);
          return;
        }

        try {
          const content = await bufferStream(stream);

          entry.contentType = getContentType(entry.path);
          entry.integrity = getIntegrity(content);
          entry.lastModified = header.mtime?.toUTCString();
          entry.size = content.length;

          foundEntry = entry;

          next();
        } catch (error) {
          next(error);
        }
      })
      .on('finish', () => {
        accept(foundEntry);
      });
  });
}

async function serveFileMetadata(req: Request, res: Response) {
  const stream = await getPackage(req.packageName, req.packageVersion, req.log);
  const entry = await findEntry(stream!, req.filename);

  if (!entry) {
    // TODO: 404
  }

  res.send(entry);
}

export default asyncHandler(serveFileMetadata);
