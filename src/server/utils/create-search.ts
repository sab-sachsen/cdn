import type { Request } from 'express';

export default function createSearch(query: Request['query']): string {
  const keys = Object.keys(query).sort();
  const pairs = keys.reduce(
    (memo, key) =>
      memo.concat(
        query[key] == null || query[key] === ''
          ? key
          : `${key}=${encodeURIComponent(query[key] as string)}`
      ),
    [] as string[]
  );

  return pairs.length ? `?${pairs.join('&')}` : '';
}
