import { createLRUCacheConfig } from './npm';

describe('createLRUCacheConfig', () => {
    it('returns given max, maxSize, ttl and adds sizeCalc', () => {
        expect(createLRUCacheConfig(4, 1_048_576, 60_000)).toEqual({
            max: 4,
            maxSize: 1_048_576,
            sizeCalculation: expect.any(Function),
            ttl: 60_000
        });
    })

    it('returns given max, maxSize and defaults', () => {
        expect(createLRUCacheConfig(4, 1_048_576)).toEqual({
            max: 4,
            maxSize: 1_048_576,
            sizeCalculation: expect.any(Function),
            ttl: 300_000
        });
    });

    it('returns given max and _omits_ maxSize, sizeCalc', () => {
        expect(createLRUCacheConfig(4)).toEqual({
            max: 4,
            ttl: 300_000
        });
    });

    it('returns given maxSize and _omits_ max', () => {
        expect(createLRUCacheConfig(undefined, 1_048_576)).toEqual({
            maxSize: 1_048_576,
            sizeCalculation: expect.any(Function),
            ttl: 300_000
        });
    });

    it('returns given ttl and defaults', () => {
        expect(createLRUCacheConfig(undefined, undefined, 60_000)).toEqual({
            maxSize: 262_144_000,
            sizeCalculation: expect.any(Function),
            ttl: 60_000
        });
    });

    it('returns defaults if no args are given', () => {
        expect(createLRUCacheConfig()).toEqual({
            maxSize: 262_144_000,
            sizeCalculation: expect.any(Function),
            ttl: 300_000
        });
    });
});
