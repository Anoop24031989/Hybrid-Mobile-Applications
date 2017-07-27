var http        = require("http");
http.createServer(function(request, response) {  
  response.writeHead(200, {"Content-Type": "text/html"});  
  response.write("Hello from the Node.js server!");
  var ConversationV1 = require('watson-developer-cloud/conversation/v1');
  var prompt = require('prompt-sync')();
  var conversation = new ConversationV1({
		  "url": "https://gateway.watsonplatform.net/conversation/api",
		  "username": "70c8e694-70ef-495b-91e8-50258036cbdb",
		  "password": "mFm5R7Fotcd1",
		  "path": { "workspace_id": "f9a58964-43ac-41ca-8f1c-ae0ed9cbbc47" },
		  "version_date": "2017-05-19"
  });
//Start conversation with empty message.
	conversation.message({}, processResponse);

	// Process the conversation response.
	function processResponse(err, res) {
	  if (err) {
	    console.log('Response1 : '+JSON.stringify(err));
	  }else{
		  
		  if (res.intents.length > 0) {
			    console.log('Detected intent: #' + res.intents[0].intent);
			  }
		  
		  
		  if (res.output.text.length != 0) {
		      console.log('Response2 :'+ res.output.text);
		      
		  }
		  var newMessageFromUser = prompt('>> ');
		  conversation.message({  
		    "input": { "text": newMessageFromUser }
		    }, processResponse)
	  }
	 
	}
 /* var path = requestInfo.getPath(request);
  response.write("
Request for " + path + " received.
");
*/  response.end();
}).listen(8081, '10.44.11.33');
console.log('Server is listening to http://10.44.11.33/ on port 8080…');