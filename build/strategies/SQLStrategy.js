'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Knex = require('knex');

const defaultConfig = {
  dialect: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: './db.sqlite3'
  }
};

module.exports = class SQLStrategy {
  constructor(config = defaultConfig) {
    this.knex = Knex(config);
  }

  initialize() {
    return this.knex.schema.createTableIfNotExists('shops', table => {
      table.increments('id');
      table.string('shopify_domain');
      table.string('access_token');
      table.unique('shopify_domain');
    });
  }

  storeShop({ shop, accessToken }) {
    var _this = this;

    return _asyncToGenerator(function* () {
      yield _this.knex.raw(`INSERT OR IGNORE INTO shops (shopify_domain, access_token) VALUES ('${shop}', '${accessToken}')`);

      return { accessToken };
    })();
  }

  getShop({ shop }) {
    return this.knex('shops').where('shopify_domain', shop);
  }
};