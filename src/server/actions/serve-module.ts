import type { Request, Response } from 'express';

import serveHTMLModule from './serve-html-module';
import serveJavaScriptModule from './serve-java-script-module';

export default function serveModule(req: Request, res: Response) {
  if (req.entry.contentType === 'application/javascript') {
    return serveJavaScriptModule(req, res);
  }

  if (req.entry.contentType === 'text/html') {
    return serveHTMLModule(req, res);
  }

  res
    .status(403)
    .type('text')
    .send('module mode is available only for JavaScript and HTML files');
}
