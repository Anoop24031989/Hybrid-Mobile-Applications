var common = require('./common');
var cors = require('cors')
var express = require('express');
var router = express.Router();
var path = require("path");
var reqst = require("request");
var builder = require('xmlbuilder');
var dateFormat = require('dateformat');
var Q = require('Q');
var base64 = require('base-64');
var utf8 = require('utf8');
var xmlreader = require('xmlreader');
var util = require('util');
var logFile;
var logStdout;
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({
	extended : true
});
router.use(urlencodedParser);
router.use(cors());
router.use(function timeLog (req, res, next) {
	
	common.createLog("cardInfo.log").then(function(res){
		logFile=res;
		logStdout=process.stdout;
		console.log = function(d) { //
			logFile.write(util.format(d) + '\n');
			logStdout.write(util.format(d) + '\n');
			
		};
		next()
	}, function(error){
		 console.log('Log File Creation Failed :'+ error);
	});
	
})

router.post('/chatbot',function(request,response){
	console.log('*********************chatbot*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	response.writeHead(200, {"Content-Type": "text/html"}); 
	var chatText = request.body.msg;
	console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
	var ConversationV1 = require('watson-developer-cloud/conversation/v1');

	// Set up Conversation service wrapper.
	var conversation = new ConversationV1({
		  "url": "https://gateway.watsonplatform.net/conversation/api",
		  "username": "70c8e694-70ef-495b-91e8-50258036cbdb",
		  "password": "mFm5R7Fotcd1",
		  "path": { "workspace_id": "f9a58964-43ac-41ca-8f1c-ae0ed9cbbc47" },
		  "version_date": "2017-05-19"
	});

	// Start conversation with empty message.
	conversation.message({
		"input": { "text": chatText }
	}, processResponse);

	// Process the conversation response.
	function processResponse(err, res) {
	  if (err) {
	    console.log('Time: '+ common.currentDateTime()+'\n Error : '+JSON.stringify(err));
	    response.write("Process Response Error:"+JSON.stringify(err));
	  }else{
		  if (res.intents.length > 0) {
			    console.log('Detected intent: #' + res.intents[0].intent);
			  }
		  
		  if (res.output.text.length != 0) {
			  
			  response.send(res.output.text[0]);
			  response.write('<br>'+res.output.text[0]+'<form action="http://10.44.11.33:8081/contest/chatbot" method="post">'
					  			+'<fieldset>'
						           +' <label for="name">>></label>'
						           +'<input type="text" id="msg" name="msg" placeholder="message.." />'
						            +'<input type="submit" value="Send message" />'
						          +' </fieldset>'
						         +'</form>');
		      console.log('Time: '+ common.currentDateTime()+'\n Response :'+ res.output.text[0]);
		      
		  }
		 
	  }
	 
	}
})
module.exports = router;