
/**
 * Dependencies.
 */

var redis = require('redis');

/**
 * Cached client instance.
 *
 * @type {RedisClient}
 * @api private
 */

var client = null;

/**
 * Accessor for lazily creating the client and
 * to allow a custom client to be set.
 *
 * @api private
 */

Object.defineProperty(exports, 'client', {
  get: function(){
    return client || (client = redis.createClient());
  },
  set: function(value){
    if ('function' == typeof value) client = value()
    else client = value;
  }
});