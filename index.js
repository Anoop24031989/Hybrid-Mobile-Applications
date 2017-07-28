var express = require('express');
var app = express();
var master = require('./master');
var userInfo = require('./UserInfo')
var cardInfo = require('./cardInfo')
var cors = require('cors')
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
app.use(jsonParser);
app.use(cors());
app.use('/master', master);
app.use('/userInfo', userInfo);
app.use('/cardInfo', cardInfo);
var server = app.listen(8080, function() {
	var host = server.address().address
	var port = server.address().port
	console.log("Example app listening at http://%s:%s", host, port)
});

