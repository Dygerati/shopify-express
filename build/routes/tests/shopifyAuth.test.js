'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const findFreePort = require('find-free-port');
const fetch = require('node-fetch');
const http = require('http');
const express = require('express');

const { MemoryStrategy } = require('../../strategies');
const createShopifyAuthRoutes = require('../shopifyAuth');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

let server;
let afterAuth;
describe('shopifyAuth', _asyncToGenerator(function* () {
  beforeEach(_asyncToGenerator(function* () {
    afterAuth = jest.fn();
    server = yield createServer({ afterAuth });
  }));

  afterEach(function () {
    server.close();
  });

  describe('/', function () {
    it('responds to get requests by returning a redirect page', _asyncToGenerator(function* () {
      const response = yield fetch(`${BASE_URL}/auth?shop=shop1`);
      const data = yield response.text();

      expect(response.status).toBe(200);
      expect(data).toMatchSnapshot();
    }));

    it('redirect page includes per-user grant for accessMode: online', _asyncToGenerator(function* () {
      yield server.close();
      server = yield createServer({ accessMode: 'online' });

      const response = yield fetch(`${BASE_URL}/auth?shop=shop1`);
      const data = yield response.text();

      expect(response.status).toBe(200);
      expect(data).toContain('grant_options%5B%5D=per-user');
    }));

    it('responds with a 400 when no shop query parameter is given', _asyncToGenerator(function* () {
      const response = yield fetch(`${BASE_URL}/auth`);
      const data = yield response.text();

      expect(response.status).toBe(400);
      expect(data).toMatchSnapshot();
    }));
  });

  describe('/callback', function () {
    it('errors when hmac validation fails', function () {
      pending();
    });

    it('does not error when hmac validation succeds', function () {
      pending();
    });

    it('requests access token', function () {
      pending();
    });

    it('console warns when no session is present on request context', function () {
      pending();
    });
  });
}));

function createServer(userConfig = {}) {
  const app = express();

  const serverConfig = {
    host: 'http://myshop.myshopify.com',
    apiKey: 'key',
    secret: 'secret',
    scope: ['scope'],
    shopStore: new MemoryStrategy(),
    accessMode: 'offline',
    afterAuth: jest.fn()
  };

  const { auth, callback } = createShopifyAuthRoutes(Object.assign({}, serverConfig, userConfig));

  app.use('/auth', auth);
  app.use('/auth/callback', callback);
  server = http.createServer(app);

  return new Promise((resolve, reject) => {
    findFreePort(PORT, (err, freePort) => {
      if (err) {
        throw err;
      }
      server.listen(PORT, resolve(server));
    });
  });
}