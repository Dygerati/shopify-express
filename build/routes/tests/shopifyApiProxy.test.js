'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const findFreePort = require('find-free-port');
const express = require('express');
const http = require('http');
const fetch = require.requireActual('node-fetch');
const fetchMock = require.requireMock('node-fetch');

const shopifyApiProxy = require('../shopifyApiProxy');

const { DISALLOWED_URLS } = shopifyApiProxy;
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const API_ROUTE = '/api';

jest.mock('node-fetch');

let session;
let server;
const originalConsoleError = console.error;
describe('shopifyApiProxy', _asyncToGenerator(function* () {
  beforeEach(_asyncToGenerator(function* () {
    fetchMock.mockImplementation(function () {
      return { status: 200, text: function () {
          return Promise.resolve();
        } };
    });

    session = {
      shop: 'shop.com',
      accessToken: 'token'
    };

    server = yield createServer();
    console.error = jest.fn();
  }));

  afterEach(function () {
    fetchMock.mockClear();
    server.close();
    console.error = originalConsoleError;
  });

  it('errors when no session is present', _asyncToGenerator(function* () {
    const endpoint = '/products';
    session = null;

    const response = yield fetch(`${BASE_URL}${API_ROUTE}${endpoint}`);

    expect(fetchMock).not.toBeCalled();
    expect(console.error).toBeCalledWith('A session middleware must be installed to use ApiProxy.');
    expect(response.status).toBe(401);
  }));

  it('errors when shop information is not in session', _asyncToGenerator(function* () {
    const endpoint = '/products';
    session.shop = null;
    session.accessToken = null;

    const response = yield fetch(`${BASE_URL}${API_ROUTE}${endpoint}`);

    expect(fetchMock).not.toBeCalled();
    expect(response.status).toBe(401);
  }));

  it('proxies requests to the shop given in session', _asyncToGenerator(function* () {
    const shop = 'some-shop.com';
    const endpoint = '/products';
    session.shop = shop;

    const expectedPath = `https://${shop}/admin${endpoint}`;
    const response = yield fetch(`${BASE_URL}${API_ROUTE}${endpoint}`);

    expect(fetchMock).toBeCalled();
    expect(fetchMock.mock.calls[0][0]).toBe(expectedPath);
    expect(response.status).toBe(200);
  }));

  it('includes the access token given in session and json content type', _asyncToGenerator(function* () {
    const accessToken = 'foo-token';
    session.accessToken = accessToken;

    const expectedHeaders = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken
    };
    const expectedPath = `https://${session.shop}/admin/`;

    const response = yield fetch(`${BASE_URL}${API_ROUTE}`);

    expect(fetchMock).toBeCalled();
    expect(fetchMock.mock.calls[0][1].headers).toMatchObject(expectedHeaders);
    expect(response.status).toBe(200);
  }));

  it('does not proxy requests to dissallowed urls', _asyncToGenerator(function* () {
    for (const url of DISALLOWED_URLS) {
      response = yield fetch(`${BASE_URL}${API_ROUTE}${url}`);
      expect(response.status).toBe(403);
    }
  }));

  it('returns body from proxied request', _asyncToGenerator(function* () {
    const expectedBody = 'body text';
    fetchMock.mockImplementation(function () {
      return { status: 200, text: function () {
          return Promise.resolve(expectedBody);
        } };
    });

    const response = yield fetch(`${BASE_URL}${API_ROUTE}`);
    const body = yield response.text();

    expect(response.status).toBe(200);
    expect(body).toBe(expectedBody);
  }));
}));

function createServer() {
  const app = express();

  app.use(API_ROUTE, (req, _, next) => {
    req.session = session;
    next();
  }, shopifyApiProxy);

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