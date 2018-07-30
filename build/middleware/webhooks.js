'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const crypto = require('crypto');
const getRawBody = require('raw-body');

module.exports = function configureWithWebhook({ secret, shopStore }) {
  return function createWebhookHandler(onVerified) {
    return (() => {
      var _ref = _asyncToGenerator(function* (request, response, next) {
        const { body: data } = request;
        const hmac = request.get('X-Shopify-Hmac-Sha256');
        const topic = request.get('X-Shopify-Topic');
        const shopDomain = request.get('X-Shopify-Shop-Domain');

        try {
          const rawBody = yield getRawBody(request);
          const generated_hash = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');

          if (generated_hash !== hmac) {
            response.status(401).send();
            onVerified(new Error("Unable to verify request HMAC"));
            return;
          }

          const { accessToken } = yield shopStore.getShop({ shop: shopDomain });

          request.body = rawBody.toString('utf8');
          request.webhook = { topic, shopDomain, accessToken };

          response.status(200).send();

          onVerified(null, request);
        } catch (error) {
          response.status(401).send();
          onVerified(new Error("Unable to verify request HMAC"));
          return;
        }
      });

      function withWebhook(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return withWebhook;
    })();
  };
};