
## redis-hll

A Redis backed HyperLogLog implementation for node.js, basically ported from [hyperloglog-redis](https://github.com/aaw/hyperloglog-redis).

### Install

```sh
npm install redis-hll
```

### Usage

```js
// dependencies

var redis = require('redis').createClient();
var hll = require('redis-hll')(redis);
var assert = require('assert');

// create a new counter

var counter = hll.counter('beatles');

// add some values

var beatles = ['john', 'paul', 'george', 'ringo', 'john', 'paul'];
var n = beatles.length;

beatles.forEach(function(beatle){
  counter.add(beatle, function(err){
    if (err) return next(err);
    --n || next();
  });
});

// fetch the cardinality of the hll

function next(err){
  if (err) return console.error(err);
  counter.count(function(err, total){
    if (err) return console.error(err);
    assert(4 === total);
  });
}
```

### TODO

  - test tons of values
  - unions
  - intersections
  - refactor


### License

MIT