'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const util = require('util');
const redis = require('redis');

module.exports = class RedisStrategy {
  constructor(redisConfig) {
    const client = redis.createClient(redisConfig);

    this.client = {
      hgetall: util.promisify(client.hgetall).bind(client),
      hmset: util.promisify(client.hmset).bind(client)
    };
  }

  storeShop({ shop, accessToken }) {
    var _this = this;

    return _asyncToGenerator(function* () {
      yield _this.client.hmset(shop, { accessToken });

      return { accessToken };
    })();
  }

  getShop({ shop }) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return (yield _this2.client.hgetall(shop)) || {};
    })();
  }
};