import type { NextFunction, Request, Response } from 'express';
import parsePackagePathname from '../utils/parse-package-pathname';

/**
 * Parse the pathname in the URL. Reject invalid URLs.
 */
export default function validatePackagePathname(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parsed = parsePackagePathname(req.path);

  if (parsed == null) {
    return res.status(403).send({ error: `Invalid URL: ${req.path}` });
  }

  req.packageName = parsed.packageName;
  req.packageVersion = parsed.packageVersion;
  req.packageSpec = parsed.packageSpec;
  req.filename = parsed.filename;

  next();
}
