// in order to get the changed process.env applied, we have to mock the
// implementation to reset the module for each `createServer` call
jest.mock('../server/middleware/validate-package-name', () => ({
  __esModule: true,
  default: jest.fn((...args: unknown[]) =>
    jest
      .requireActual('../server/middleware/validate-package-name')
      .default(...args)
  )
}));

import request from 'supertest';
import createServer from '../server/create-server';

describe('Invalid package names', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('are rejected', done => {
    request(createServer())
      .get('/_invalid/index.js')
      .end((_, res) => {
        expect(res.statusCode).toBe(403);
        done();
      });
  });

  it('rejects scope mismatches', done => {
    process.env.SCOPES = '@valid';
    request(createServer())
      .get('/@invalid/pkg/index.js')
      .end((_, res) => {
        expect(res.statusCode).toBe(403);
        done();
      });
  });

  it('allows single scopes', done => {
    process.env.SCOPES = '@valid';
    request(createServer())
      .get('/@valid/pkg/index.js')
      .end((_, res) => {
        expect(res.statusCode).toBe(404);
        done();
      });
  });

  it('allows multiple scopes', async () => {
    process.env.SCOPES = '@valid @also-valid';
    await Promise.allSettled([
      new Promise<void>(resolve =>
        request(createServer())
          .get('/@invalid/pkg/index.js')
          .end((_, res) => {
            expect(res.statusCode).toBe(403);
            resolve();
          })
      ),
      new Promise<void>(resolve =>
        request(createServer())
          .get('/@valid/pkg/index.js')
          .end((_, res) => {
            expect(res.statusCode).toBe(404);
            resolve();
          })
      ),
      new Promise<void>(resolve =>
        request(createServer())
          .get('/@also-valid/pkg/index.js')
          .end((_, res) => {
            expect(res.statusCode).toBe(404);
            resolve();
          })
      )
    ]);
  });

  it('matches whole package name', async () => {
    process.env.SCOPES = 'lit';
    await Promise.allSettled([
      new Promise<void>(resolve =>
        request(createServer())
          .get('/jquery/index.js')
          .end((_, res) => {
            expect(res.statusCode).toBe(403);
            resolve();
          })
      ),
      new Promise<void>(resolve =>
        request(createServer())
          .get('/lit/index.js')
          .end((_, res) => {
            expect(res.statusCode).toBe(404);
            resolve();
          })
      )
    ]);
  });
});
