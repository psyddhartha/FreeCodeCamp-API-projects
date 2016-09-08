var express = require('express');
var app = express();

app.get('/', function(req, res) {

    res.sendFile(__dirname + '/index.html');
});

app.get('/:date', function(req, res) {
    var str = Number(req.params.date) || req.params.date;
    var date = new Date(str);
    res.jsonp({"unix": date.getTime(), "natural": date.toDateString() === "Invalid Date" ? null : date.toDateString()});
});

app.listen(process.env.PORT);
console.log("hhne");