var express = require('express');
var app = express();

//For hosting our static html assets at the root path
app.use('/', express.static(__dirname + '/src'));

var server = app.listen(8080, function() {
    var host = server.address().address
    var port = server.address().port
    console.log("HCI Multi Touch Study live at http://%s:%s", host, port)
})