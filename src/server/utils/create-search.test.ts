import createSearch from './create-search';

describe('createSearch', () => {
  it('omits the trailing = for empty string values', () => {
    expect(createSearch({ a: 'a', b: '' })).toEqual('?a=a&b');
  });

  it('omits the trailing = for null/undefined values', () => {
    expect(createSearch({ a: 'a', b: null as any })).toEqual('?a=a&b');
    expect(createSearch({ a: 'a', b: undefined as any })).toEqual('?a=a&b');
  });

  it('sorts keys', () => {
    expect(createSearch({ b: 'b', a: 'a', c: 'c' })).toEqual('?a=a&b=b&c=c');
  });

  it('returns an empty string when there are no params', () => {
    expect(createSearch({})).toEqual('');
  });
});
