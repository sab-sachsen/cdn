import { Readable } from 'node:stream';
import type Fetch from 'node-fetch';

import gunzip from 'gunzip-maybe';
import LRUCache from 'lru-cache';

import type { Log } from '../types/log.types';
import type { PackageConfig } from '../types/package-config.type';

import { createLRUCacheConfig } from './cache-config';

declare const fetch: typeof Fetch;

const npmRegistryURL =
  process.env.NPM_REGISTRY_URL || 'https://registry.npmjs.org';
const npmAuthToken = process.env.NPM_AUTH_TOKEN;
const npmAuthUsername = process.env.NPM_AUTH_USERNAME;
const npmAuthPassword = process.env.NPM_AUTH_PASSWORD;
const auth = npmAuthToken
  ? `Bearer ${npmAuthToken}`
  : npmAuthUsername && npmAuthPassword
  ? `Basic ${Buffer.from(`${npmAuthUsername}:${npmAuthPassword}`).toString(
      'base64'
    )}`
  : undefined;

// create and configure cache
const { LRU_CACHE_MAX, LRU_CACHE_MAX_SIZE, LRU_CACHE_TTL } = process.env;
export const cacheConfig = createLRUCacheConfig({
  max: LRU_CACHE_MAX ? Number(LRU_CACHE_MAX) : undefined,
  maxSize: LRU_CACHE_MAX_SIZE ? Number(LRU_CACHE_MAX_SIZE) : undefined,
  ttl: LRU_CACHE_TTL ? Number(LRU_CACHE_TTL) : undefined
});
const cache = new LRUCache<string, string>(cacheConfig);

const notFound = '0';

function isScopedPackageName(packageName: string): boolean {
  return packageName.startsWith('@');
}

function encodePackageName(packageName: string): string {
  return isScopedPackageName(packageName)
    ? `@${encodeURIComponent(packageName.substring(1))}`
    : encodeURIComponent(packageName);
}

async function fetchPackageInfo(
  packageName: string,
  log: Log
): Promise<PackageConfig | null> {
  const name = encodePackageName(packageName);
  const infoURL = `${npmRegistryURL}/${name}`;

  log.debug('Fetching package info for %s from %s', packageName, infoURL);

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (auth !== undefined) headers.Authorization = auth;

  try {
    const res = await fetch(infoURL, { headers });

    if (res.status === 200) {
      return await res.json();
    }

    if (res.status === 404) {
      return null;
    }

    log.error(
      'Error fetching info for %s (status: %s)',
      packageName,
      res.status
    );
    log.error(res.statusText);

    return null;
  } catch (error) {
    log.error(error);
    return null;
  }
}

type VersionsAndTags = {
  versions: string[];
  tags: Record<string, string>;
};

async function fetchVersionsAndTags(
  packageName: string,
  log: Log
): Promise<VersionsAndTags | null> {
  const info = await fetchPackageInfo(packageName, log);
  return info && info.versions
    ? { versions: Object.keys(info.versions), tags: info['dist-tags'] }
    : null;
}

/**
 * Returns an object of available { versions, tags }.
 * Uses a cache to avoid over-fetching from the registry.
 */
export async function getVersionsAndTags(
  packageName: string,
  log: Log
): Promise<VersionsAndTags | null> {
  const cacheKey = `versions-${packageName}`;
  const cacheValue = cache.get(cacheKey);

  if (cacheValue != null) {
    return cacheValue === notFound ? null : JSON.parse(cacheValue);
  }

  const value = await fetchVersionsAndTags(packageName, log);

  if (value === null) {
    cache.set(cacheKey, notFound);
    return null;
  }

  cache.set(cacheKey, JSON.stringify(value));
  return value;
}

// All the keys that sometimes appear in package info
// docs that we don't need. There are probably more.
const packageConfigExcludeKeys = [
  'browserify',
  'bugs',
  'directories',
  'engines',
  'files',
  'homepage',
  'keywords',
  'maintainers',
  'scripts'
];

function cleanPackageConfig(config: PackageConfig): PackageConfig {
  return Object.keys(config).reduce((memo, key) => {
    if (!key.startsWith('_') && !packageConfigExcludeKeys.includes(key)) {
      memo[key as keyof PackageConfig] = config[
        key as keyof PackageConfig
      ] as any;
    }

    return memo;
  }, {} as PackageConfig);
}

async function fetchPackageConfig(
  packageName: string,
  version: string,
  log: Log
): Promise<PackageConfig | null> {
  const info = await fetchPackageInfo(packageName, log);
  return info && info.versions && version in info.versions
    ? cleanPackageConfig(info.versions[version])
    : null;
}

/**
 * Returns metadata about a package, mostly the same as package.json.
 * Uses a cache to avoid over-fetching from the registry.
 */
export async function getPackageConfig(
  packageName: string,
  version: string,
  log: Log
): Promise<PackageConfig | null> {
  const cacheKey = `config-${packageName}-${version}`;
  const cacheValue = cache.get(cacheKey);

  if (cacheValue != null) {
    return cacheValue === notFound ? null : JSON.parse(cacheValue);
  }

  const value = await fetchPackageConfig(packageName, version, log);

  if (value == null) {
    cache.set(cacheKey, notFound);
    return null;
  }

  cache.set(cacheKey, JSON.stringify(value));
  return value;
}

/**
 * Returns a stream of the tarball'd contents of the given package.
 */
export async function getPackage(
  packageName: string,
  version: string,
  log: Log
): Promise<NodeJS.ReadableStream | null> {
  const tarballName = isScopedPackageName(packageName)
    ? packageName.split('/')[1]
    : packageName;
  const tarballURL = `${npmRegistryURL}/${packageName}/-/${tarballName}-${version}.tgz`;

  log.debug('Fetching package for %s from %s', packageName, tarballURL);

  const headers: Record<string, string> = {};
  if (auth !== undefined) headers.Authorization = auth;

  try {
    const res = await fetch(tarballURL, { headers });

    if (res.status === 200) {
      return Readable.from(res.body).pipe(gunzip());
    }

    if (res.status === 404) {
      return null;
    }

    log.error(
      'Error fetching tarball for %s@%s (status: %s)',
      packageName,
      version,
      res.status
    );
    log.error(res.statusText);

    return null;
  } catch (error) {
    log.error(error);
    return null;
  }
}
