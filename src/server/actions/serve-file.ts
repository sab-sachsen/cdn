import type { Request, Response } from 'express';
import { extname } from 'node:path';
import etag from 'etag';

import getContentTypeHeader from '../utils/get-content-type-header';

export default function serveFile(req: Request, res: Response) {
  const tags = ['file'];

  const ext = extname(req.entry.path).substr(1);
  if (ext) {
    tags.push(`${ext}-file`);
  }

  res
    .set({
      'Content-Type': getContentTypeHeader(req.entry.contentType),
      'Content-Length': req.entry.size,
      'Cache-Control': 'public, max-age=31536000', // 1 year
      'Last-Modified': req.entry.lastModified,
      ETag: etag(req.entry.content!),
      'Cache-Tag': tags.join(', ')
    })
    .send(req.entry.content);
}
