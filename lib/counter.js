
/**
 * Dependencies.
 */

var mm3 = require('murmurhash3');
var redis = require('./redis');

/**
 * Export `Counter`.
 */

module.exports = Counter;

/**
 * Construct a new HyperLogLog "counter".
 *
 * @param {String} key
 * @param {Number} b
 * @api public
 */

function Counter(key, b){
  b = b || 10;

  if (b < 4 || b > 16) {
    throw new RangeError('must be between 4 and 16');
  }

  this.b = b;
  this.m = Math.floor(Math.pow(2, this.b));
  this.bits = 32 - this.b;
  this.key = key;
  this.redis = redis.client;

  switch (this.m) {
    case 16: this.alpha = 0.673; break;
    case 32: this.alpha = 0.697; break;
    case 64: this.alpha = 0.709; break;
    default: this.alpha = 0.7213 / (1 + 1.079 / this.m);
  }
}

/**
 * Adds `item` to the HLL.
 *
 * @param {String} item
 * @param {Function} fn
 * @api public
 */

Counter.prototype.add = function(item, fn){
  fn = fn || noop;
  var self = this;
  mm3.murmur32(item, function(err, hash){
    if (err) return fn(err);

    var redis = self.redis;
    var key = self.key;
    var offset = hash % self.m;

    redis.getrange(key, offset, offset, function(err, existing){
      if (err) return fn(err);
      var tmp = hash / self.m;
      var value;

      if (tmp === 0) {
        value = self.bits + 1;
      } else {
        value = self.bits - Math.floor(Math.log(tmp) / Math.LN2);
      }

      if (value <= existing.charCodeAt(0)) return fn(null, false);
      redis.setrange(key, offset, String.fromCharCode(value), fn);
    });
  });
};

/**
 * Estimates the cardinatlity.
 *
 * @param {Function} fn
 * @api public
 */

Counter.prototype.count = function(fn){
  var self = this;

  this.redis.get(this.key, function(err, value){
    if (err) return fn(err);
    if (!value) return fn(null, 0);

    var pow = Math.pow;
    var count = 0;
    var ch = 0;
    var sum = 0.0;

    for (var i = 0; i < self.m; i++) {
      if (!value[i]) continue;
      ch = value[i].charCodeAt(0);
      if (ch > 0) {
        sum += pow(2.0, -ch);
        count += 1;
      }
    }

    var m = self.m;
    var alpha = self.alpha;
    var estimate = alpha * m * m / (sum + m - count);
    var ret = 0;

    if (estimate <= 2.5 * m) {
      if (count == m) {
        ret = estimate;
      } else {
        ret = m * (Math.log(m / (m - count)));
      }
    } else if (estimate <= (4294967296 / 30.0)) {
      ret = estimate;
    } else {
      ret = -4294967296 * Math.log(1 - (estimate / 4294967296));
    }

    fn(null, Math.round(ret));
  });
};

/**
 * Noop.
 */

function noop(){}