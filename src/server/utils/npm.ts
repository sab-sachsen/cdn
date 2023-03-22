import type { IncomingMessage } from 'node:http';
import https, { type RequestOptions } from 'node:https';
import url from 'node:url';

import gunzip from 'gunzip-maybe';
import LRUCache from 'lru-cache';

import type { Log } from '../types/log.types';
import type { PackageConfig } from '../types/package-config.type';

import { createLRUCacheConfig } from './cache-config';
import bufferStream from './buffer-stream';

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

const agent = new https.Agent({
  keepAlive: true
});

// create and configure cache
const { LRUCacheMax, LRUCacheMaxSize, LRUCacheTTL } = process.env;
export const cacheConfig = createLRUCacheConfig({
  max: LRUCacheMax ? Number(LRUCacheMax) : undefined,
  maxSize: LRUCacheMaxSize ? Number(LRUCacheMaxSize) : undefined,
  ttl: LRUCacheTTL ? Number(LRUCacheTTL) : undefined
});
const cache = new LRUCache<string, string>(cacheConfig);

const notFound = '0';

async function get(options: RequestOptions): Promise<IncomingMessage> {
  return new Promise((accept, reject) => {
    https.get(options, accept).on('error', reject);
  });
}

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

  const { hostname, pathname } = url.parse(infoURL);
  const options = {
    agent: agent,
    hostname: hostname,
    path: pathname,
    headers: {
      Accept: 'application/json',
      Authorization: auth
    }
  };

  const res = await get(options);

  if (res.statusCode === 200) {
    return bufferStream(res).then(buffer =>
      JSON.parse(buffer.toString('utf-8'))
    );
  }

  if (res.statusCode === 404) {
    return null;
  }

  const content = (await bufferStream(res)).toString('utf-8');

  log.error(
    'Error fetching info for %s (status: %s)',
    packageName,
    res.statusCode
  );
  log.error(content);

  return null;
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

  const { hostname, pathname } = url.parse(tarballURL);
  const options = {
    agent: agent,
    hostname: hostname,
    path: pathname,
    headers: {
      Authorization: auth
    }
  };

  const res = await get(options);

  if (res.statusCode === 200) {
    const stream = res.pipe(gunzip());
    // stream.pause();
    return stream;
  }

  if (res.statusCode === 404) {
    return null;
  }

  const content = (await bufferStream(res)).toString('utf-8');

  log.error(
    'Error fetching tarball for %s@%s (status: %s)',
    packageName,
    version,
    res.statusCode
  );
  log.error(content);

  return null;
}
