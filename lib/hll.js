
/**
 * Dependencies.
 */

var Counter = require('./counter');
var redis = require('./redis');

/**
 * Export.
 *
 * @param {RedisClient} [client]
 * @return {Object}
 * @api public
 */

module.exports = exports = function(client){
  if (client) redis.client = client;
  return exports;
};

/**
 * Counter factory.
 *
 * @param {String} key
 * @param {Number} [b]
 * @return {Counter}
 * @api public
 */

exports.counter = function(key, b){
  return new Counter(key, b);
};
