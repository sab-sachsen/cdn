import type { Request } from 'express';
import type { SemVer } from 'semver';
import createSearch from './create-search';

export default function createPackageURL(
  packageName: string,
  packageVersion: string | SemVer,
  filename: string,
  query: Request['query']
): string {
  let url = `/${packageName}`;

  if (packageVersion) url += `@${packageVersion}`;
  if (filename) url += filename;
  if (query) url += createSearch(query);

  return url;
}
