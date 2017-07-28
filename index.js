var express = require('express');
var app = express();
var master = require('./master');
var userInfo = require('./UserInfo')
var cardInfo = require('./cardInfo')
//var chat = require('./ibmWatsonContest')
var cors = require('cors')
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
app.use(jsonParser);
app.use(cors());
app.use('/master', master);
app.use('/userInfo', userInfo);
app.use('/cardInfo', cardInfo);
//app.use('/contest', chat);
var server = app.listen(8080, function() {
	var host = server.address().address
	var port = server.address().port
	console.log("Example app listening at http://%s:%s", host, port)
});

/*var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
 
// Initialize appication with route / (that means root of the application)
app.get('/', function(req, res){
  var express=require('express');
  app.use(express.static(path.join(__dirname)));
  res.sendFile(path.join(__dirname, '../MADP_NodeJs_API', 'chat.html'));
});
 
// Register events on socket connection
io.on('connection', function(socket){ 
//console.log(socket);
  socket.on('chatMessage', function(from, msg){
	  console.log('chatMessage');
	  console.log(from);
	  console.log(msg);
    io.emit('chatMessage', from, msg);
  });
  socket.on('notifyUser', function(user){
	  console.log('notifyUser');
	  console.log(user);
    io.emit('notifyUser', user);
  });
});
 
// Listen application request on port 3000
http.listen(3000, function(){
  console.log('listening on :3000');
});*/