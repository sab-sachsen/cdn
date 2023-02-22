import type { Application } from 'express';
import request from 'supertest';

import createServer from '../server/create-server';

describe('Invalid package names', () => {
  let server: Application;
  beforeEach(() => {
    server = createServer();
  });

  it('are rejected', done => {
    request(server)
      .get('/_invalid/index.js')
      .end((err, res) => {
        expect(res.statusCode).toBe(403);
        done();
      });
  });
});
