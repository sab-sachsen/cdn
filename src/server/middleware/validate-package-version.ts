import { maxSatisfying, type SemVer } from 'semver';
import type { NextFunction, Request, Response } from 'express';

import type { Log } from '../types/log.types';

import asyncHandler from '../utils/async-handler';
import createPackageURL from '../utils/create-package-url';
import { getPackageConfig, getVersionsAndTags } from '../utils/npm';

function semverRedirect(
  req: Request,
  res: Response,
  newVersion: string | SemVer
) {
  res
    .set({
      'Cache-Control': 'public, s-maxage=600, max-age=60', // 10 mins on CDN, 1 min on clients
      'Cache-Tag': 'redirect, semver-redirect'
    })
    .redirect(
      302,
      req.baseUrl +
      createPackageURL(req.packageName, newVersion, req.filename, req.query)
    );
}

async function resolveVersion(packageName: string, range: string, log: Log) {
  const versionsAndTags = await getVersionsAndTags(packageName, log);

  if (versionsAndTags) {
    const { versions = [], tags = {} } = versionsAndTags;

    if (range in tags) {
      range = tags[range as keyof typeof tags] as string;
    }

    return versions.includes(range)
      ? range
      : maxSatisfying(versions, range);
  }

  return null;
}

/**
 * Check the package version/tag in the URL and make sure it's good. Also
 * fetch the package config and add it to req.packageConfig. Redirect to
 * the resolved version number if necessary.
 */
async function validateVersion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const version = await resolveVersion(
    req.packageName,
    req.packageVersion,
    req.log
  );

  if (!version) {
    return res
      .status(404)
      .type('text')
      .send(`Cannot find package ${req.packageSpec}`);
  }

  if (version !== req.packageVersion) {
    return semverRedirect(req, res, version);
  }

  const packageConfig = await getPackageConfig(
    req.packageName,
    req.packageVersion,
    req.log
  );

  if (!packageConfig) {
    return res
      .status(500)
      .type('text')
      .send(`Cannot get config for package ${req.packageSpec}`);
  }

  req.packageConfig = packageConfig;

  next();
}

export default asyncHandler(validateVersion);
