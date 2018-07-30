'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const querystring = require('querystring');
const fetch = require('node-fetch');

const DISALLOWED_URLS = ['/application_charges', '/application_credits', '/carrier_services', '/fulfillment_services', '/recurring_application_charges', '/script_tags', '/storefront_access_token', '/webhooks', '/oauth'];

module.exports = (() => {
  var _ref = _asyncToGenerator(function* (incomingRequest, response, next) {
    const { query, method, path: pathname, body, session } = incomingRequest;

    if (session == null) {
      console.error('A session middleware must be installed to use ApiProxy.');
      response.status(401).send(new Error('Unauthorized'));
      return;
    }

    const { shop, accessToken } = session;

    if (shop == null || accessToken == null) {
      response.status(401).send(new Error('Unauthorized'));
      return;
    }

    if (!validRequest(pathname)) {
      response.status(403).send('Endpoint not in whitelist');
      return;
    }

    try {
      const searchParams = querystring.stringify(query);
      const searchString = searchParams.length > 0 ? `?${searchParams}` : '';

      const url = `https://${shop}/admin${pathname}${searchString}`;
      const result = yield fetch(url, {
        method,
        body,
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken
        }
      });

      const data = yield result.text();
      response.status(result.status).send(data);
    } catch (error) {
      console.log(error);
      response.status(500).send(error);
    }
  });

  function shopifyApiProxy(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  }

  return shopifyApiProxy;
})();

module.exports.DISALLOWED_URLS = DISALLOWED_URLS;

function validRequest(path) {
  const strippedPath = path.split('?')[0].split('.json')[0];

  return DISALLOWED_URLS.every(resource => {
    return strippedPath.indexOf(resource) === -1;
  });
}