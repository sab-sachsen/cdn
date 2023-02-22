import etag from 'etag';
import type { Request, Response } from 'express';

import getContentTypeHeader from '../utils/get-content-type-header';
import rewriteBareModuleIdentifiers from '../utils/rewrite-bare-module-identifiers';

export default function serveJavaScriptModule(req: Request, res: Response) {
  try {
    const code = rewriteBareModuleIdentifiers(
      req.entry.content!.toString('utf8'),
      req.packageConfig
    );

    res
      .set({
        'Content-Length': Buffer.byteLength(code!),
        'Content-Type': getContentTypeHeader(req.entry.contentType),
        'Cache-Control': 'public, max-age=31536000', // 1 year
        ETag: etag(code!),
        'Cache-Tag': 'file, js-file, js-module'
      })
      .send(code);
  } catch (error: any) {
    console.error(error);

    const errorName = error.constructor.name;
    const errorMessage = error.message.replace(
      /^.*?\/unpkg-.+?\//,
      `/${req.packageSpec}/`
    );
    const codeFrame = error.codeFrame;
    const debugInfo = `${errorName}: ${errorMessage}\n\n${codeFrame}`;

    res
      .status(500)
      .type('text')
      .send(
        `Cannot generate module for ${req.packageSpec}${req.filename}\n\n${debugInfo}`
      );
  }
}
