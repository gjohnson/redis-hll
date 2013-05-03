
var hll = require('..');

describe('count', function(){
  it('should estimate the cardinality', function(done){
    var counter = hll.counter('beatles');
    var beatles = ['john', 'paul', 'george', 'ringo', 'john', 'paul'];
    var n = beatles.length;

    beatles.forEach(function(beatle){
      counter.add(beatle, function(err){
        if (err) return next(err);
        --n || next();
      });
    });

    function next(err){
      if (err) return done(err);
      counter.count(function(err, total){
        if (err) return done(err);
        total.should.equal(4);
        done();
      });
    }
  });
});