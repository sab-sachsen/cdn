import type { NextFunction, Request, Response } from 'express';
import validateNpmPackageName from 'validate-npm-package-name';

const hexValue = /^[a-f0-9]+$/i;
function isHash(value: string): boolean {
  return value.length === 32 && hexValue.test(value);
}

const scopes = process.env.SCOPES?.split(' ') ?? [];
function isScopeAllowed(value: string): boolean {
  const [scope] = value.split('/');
  return scopes.length < 1 || scopes.includes(scope);
}

/**
 * Reject requests for invalid npm package names.
 */
export default function validatePackageName(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (isHash(req.packageName)) {
    return res
      .status(403)
      .type('text')
      .send(`Invalid package name "${req.packageName}" (cannot be a hash)`);
  }

  if (!isScopeAllowed(req.packageName)) {
    return res
      .status(403)
      .type('text')
      .send(`Invalid package name "${req.packageName}" (scope not allowed)`);
  }

  const errors = validateNpmPackageName(req.packageName).errors;

  if (errors) {
    const reason = errors.join(', ');

    return res
      .status(403)
      .type('text')
      .send(`Invalid package name "${req.packageName}" (${reason})`);
  }

  next();
}
