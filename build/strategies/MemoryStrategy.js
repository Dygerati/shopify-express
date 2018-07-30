"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

module.exports = class MemoryStrategy {
  constructor() {
    this.store = {};
  }

  storeShop({ shop, accessToken }) {
    var _this = this;

    return _asyncToGenerator(function* () {
      _this.store[shop] = { accessToken };

      return { accessToken };
    })();
  }

  getShop({ shop }) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return _this2.store[shop];
    })();
  }
};