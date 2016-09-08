var express = require('express');
var app = express();

app.get('/', function(req, res) {
    
    var software = req.headers["user-agent"];
    software = software.slice(software.indexOf('(')+1, software.indexOf(')'));
    res.jsonp({"ipaddress": req.ip.slice(7), "language": req.headers["accept-language"].slice(0, 5), "software": software});
});

app.listen(process.env.PORT);
console.log("Running!");