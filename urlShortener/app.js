var express = require('express');
var app = express();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var mongourl = 'mongodb://localhost:27017/test';

function mapTo62(number) {
  var result = [];
  while (Math.floor(number / 62)) {
    result.push(number % 62);
    number = Math.floor(number / 62);
  }
  result.push(number);
  result = result.reverse();
  result = result.map(function(item, index, arr) {
    var alphabet = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 
                    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    return alphabet[item];
  });
  
  return result.join('');
}

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});


app.get('/new/:prtcl//:url', function(req, res) {
    var uri = req.params.url;
    var prtcl = req.params.prtcl;
    
    if (prtcl.search(/^\D+:/i) === 0 && uri.search(/\.[a-z]+$/i) !== -1) {
      
      MongoClient.connect(mongourl, function(err, db) {
        
        assert.equal(null, err);
        
        var collection = db.collection('urls');
        var url = prtcl.concat('//', uri);
        
        
        collection.find().sort([['_id', -1]]).limit(1).nextObject(function (err, item) {
          assert.equal(err, null);
          
          if (item) {
            var obj = {
              _id: item._id+1, 
              original_url: url,
              short_url: req.protocol + '://' + req.host + '/' + mapTo62(item._id+1)
            };
            
            collection.findOneAndReplace(
              { original_url: url },
              {
                $setOnInsert: obj
              },
              {
                upsert: true
              }, 
              function(err, result) {
                assert.equal(err, null);
                res.jsonp(result.value || obj);
                db.close();
              }
            );
            
          } else {
            collection.insertOne({
              _id: 1,
              original_url: url,
              short_url: req.protocol + '://' + req.host + '/' + mapTo62(1)
            }, function(err, result) {
              assert.equal(err, null);
              res.jsonp(result.ops[0]);
              db.close();
            });
          }
          
        });
        
      });
      
    } else {
      res.jsonp({"error": "Wrong url format."});
    }
    
});


app.get('/short/:shurl', function(req, res) {
  var shurl = req.params.shurl;
  shurl = req.protocol + '://' + req.host + '/' + shurl;
  
  MongoClient.connect(mongourl, function(err, db) {
    
    assert.equal(null, err);
    var collection = db.collection('urls');
    collection.find({ short_url: shurl }).next(function(err, item) {
      assert.equal(null, err);
      res.redirect(item.original_url);
      db.close();
    });
  });

  
});


app.listen(process.env.PORT);
console.log("Running!");