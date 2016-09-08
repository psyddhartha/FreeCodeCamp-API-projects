var request = require('request');
var express = require('express');
var app = express();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var mongourl = 'mongodb://localhost:27017/test';

function getJSON(url, callback) {
    request({
        url: url,
        json: true
    }, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            callback(body);
        }
    });
}

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/search/:query', function(req, res) {
    
    MongoClient.connect(mongourl, function(err, db) {
        assert.equal(null, err);
        var col = db.collection('urls'); 
        col.insertOne({ term: req.params.query, when: new Date()}, function(err, result) {
            assert.equal(null, err);
            //res.jsonp(result.ops)
            var num = '';
            if (req.query.offset) {
                num = '&num=' + req.query.offset;
            }
            getJSON('https://www.googleapis.com/customsearch/v1?key=AIzaSyDClq0S_xfr7WT0RPOghRykzzalJE2Rqbc&cx=012340234169166311534:5e5ldyuglwu&searchType=image&q=' + req.params.query + num, function (body) {
                res.jsonp(body.items);
            });
            db.close();
        });
    });
});

app.get('/latest', function(req, res) {
    
    MongoClient.connect(mongourl, function(err, db) {
        assert.equal(null, err);
        var col = db.collection('urls'); 
        col.find().project({ _id: 0 }).toArray(function(err, result) {
            assert.equal(null, err);
            res.jsonp(result);
            db.close();
        });
    });
});

app.listen(process.env.PORT);
console.log("Running!");