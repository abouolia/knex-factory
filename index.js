const { extend, isFunction, isObject } = require('lodash');

let _knex;
const factories = { };

function knexFactory(knex) {
  _knex = knex;

  return knexFactory;
}

extend(knexFactory, {
  define(name, tableName, defaultAttributes) {
    factories[name] = { tableName, defaultAttributes };
  },

  async create(factoryName, attributes) {
    const factory = factories[factoryName];

    if (!factory) {
      throw `Unkown factory: ${factoryName}`;
    }

    const { tableName, defaultAttributes } = factory;
    const insertData = {};

    extend(insertData, defaultAttributes, attributes);

    for (let k in insertData) {
      const v = insertData[k];

      if (isFunction(v)) {
        insertData[k] = await v();

        if (isObject(insertData[k]) && insertData[k].id) {
          insertData[k] = insertData[k].id;
        }
      } else {
        insertData[k] = v;
      }
    };

    const [id] = await _knex(tableName).insert(insertData);
    const record = await _knex(tableName).where({ id }).first();

    return record;
  },
});

module.exports = knexFactory;
