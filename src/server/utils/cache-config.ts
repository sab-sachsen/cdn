export const oneMinute = 1000 * 60;
export const oneMegabyte = 1024 * 1024;

export function createLRUCacheConfig({
  max,
  maxSize,
  ttl = oneMinute * 5
}: {
  max?: number;
  maxSize?: number;
  ttl?: number;
}) {
  const sizeCalculation = (value: string) => value.length;

  if (max) {
    if (maxSize) {
      return { ttl, max, maxSize, sizeCalculation };
    } else {
      return { ttl, max };
    }
  } else {
    if (maxSize) {
      return { ttl, maxSize, sizeCalculation };
    } else {
      return { ttl, maxSize: oneMegabyte * 250, sizeCalculation };
    }
  }
}
