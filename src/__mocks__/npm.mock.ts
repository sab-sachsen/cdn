import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import gunzip from 'gunzip-maybe';

function getPackageInfo(packageName: string) {
  const file = resolve(__dirname, `./metadata/${packageName}.json`);

  try {
    return JSON.parse(readFileSync(file, 'utf-8'));
  } catch (error) {
    return null;
  }
}

export function getVersionsAndTags(packageName: string) {
  const info = getPackageInfo(packageName);
  return info
    ? { versions: Object.keys(info.versions), tags: info['dist-tags'] }
    : [];
}

export function getPackageConfig(packageName: string, version: string) {
  const info = getPackageInfo(packageName);
  return info ? info.versions[version] : null;
}

export function getPackage(packageName: string, version: string) {
  const file = resolve(__dirname, `./packages/${packageName}-${version}.tgz`);

  return existsSync(file) ? createReadStream(file).pipe(gunzip()) : null;
}
