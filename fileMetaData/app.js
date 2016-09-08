var express = require('express');
var multer = require('multer');
var upload = multer();
var app = express();

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/', upload.single('fileToUpload'), function(req, res) {
    res.jsonp({ fileSize: req.file.size }); 
});

app.listen(process.env.PORT);
console.log("App running!");