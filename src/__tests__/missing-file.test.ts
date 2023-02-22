import type { Application } from 'express';
import request from 'supertest';

import createServer from '../server/create-server';

describe('A request for a non-existent file', () => {
  let server: Application;
  beforeEach(() => {
    server = createServer();
  });

  it('returns a 404 text error', done => {
    request(server)
      .get('/preact@8.4.2/not-here.js')
      .end((err, res) => {
        expect(res.statusCode).toBe(404);
        expect(res.headers['content-type']).toMatch(/\btext\/plain\b/);
        done();
      });
  });
});
