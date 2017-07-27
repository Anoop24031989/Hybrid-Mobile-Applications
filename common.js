var dateFormat = require('dateformat');
var fs = require('fs');
var Q = require('q');
var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
exports.currentDateTime = function(){
	var date;
	date = new Date();
	date = date.getFullYear() + '-' +
	    ('00' + (date.getMonth()+1)).slice(-2) + '-' +
	    ('00' + date.getDate()).slice(-2) + ' ' + 
	    ('00' + date.getHours()).slice(-2) + ':' + 
	    ('00' + date.getMinutes()).slice(-2) + ':' + 
	    ('00' + date.getSeconds()).slice(-2);
	return date;
}
exports.getPasswordExpDate = function(currentDate){
	var date;
	console.log("currentDate :" + currentDate);
	date = new Date(currentDate);
	console.log(date);
	date.setTime( date.getTime() + 30 * 86400000 );
	date = date.getFullYear() + '-' +
	    ('00' + (date.getMonth()+1)).slice(-2) + '-' +
	    ('00' + date.getDate()).slice(-2) + ' ' + 
	    ('00' + date.getHours()).slice(-2) + ':' + 
	    ('00' + date.getMinutes()).slice(-2) + ':' + 
	    ('00' + date.getSeconds()).slice(-2);
	console.log("expiry Date :"+ date);
	return date;
}
exports.sequenceUniqueID = function(){
	var defered = Q.defer();
	var newValue;
	fs.readFile('data.txt', 'utf-8', function(err, data){
	    if (err){
	    	defered.reject(err);
	    }

	    newValue = parseInt(data)+1;
	    if(newValue.toString.length>12){
	    	newValue = 100000000000;
	    }
	   // console.log('rrn :'+ newValue);
	    fs.writeFile('data.txt', newValue, 'utf-8', function (err) {
	      if (err){
	    	  defered.reject(err);
	      }
	      defered.resolve(newValue)
	    });
	  });
	return defered.promise;
}
exports.responseMsg = function(resCode,desc,data){
	res=[{
		response_code : resCode,
		desc : desc,
		additional_data : data
	}]
	return res;
}
exports.serverUrl="http://products.fss.co.in/TSP/transaction.htm";//http://10.44.112.62:8803";//8706";  //8803
	//"http://10.44.112.62:8803";

exports.createLog=function(fileName,logMsg){
	var defered = Q.defer();
	checkDir().then(function(data){
		if(data=='ok'){
			fs.open('./logs/'+fileName, 'a+', function(err, fd) {
			   if (err) {
				   	   defered.reject(err);
				   }else{
					   console.log("File opened successfully!");   
					   var logFile = fs.createWriteStream('./logs/'+fileName, { flags: 'a' });
					   defered.resolve(logFile);
				   }
				  
				});
		}else{
			defered.reject('Directory error');
		}
		
	},function(error){
		defered.reject(error);
	});
	return defered.promise;
}

function checkDir(){
	console.log("Check Directory");
	var defered = Q.defer();
	if (fs.existsSync('./logs')) {
	    console.log('Directory exist true');
	    defered.resolve('ok');
	}else{
		fs.mkdir('./logs',function(err){
			   if (err) {
				   defered.reject(err);
			   }else{
				   console.log("Directory created successfully!");
				   defered.resolve('ok');
			   }
			   
			});
	}
	return defered.promise;
}

exports.getFormatedAmt = function(amt){
	try{
		console.log("***************************Get Formated Amt***************************");
		var floatValue= parseFloat(amt).toFixed(2);
		var floatStr=(floatValue.toString()).replace('.','');
		var floatStrLen= floatStr.length;
		if(floatStrLen<12){
			var zerosToPrepend=(12-floatStr.length);
			console.log("zerosToPrepend :"+zerosToPrepend);
			for(var i=0;i<zerosToPrepend;i++){
				floatStr="0"+floatStr;
			}
			console.log("Formated Amt:"+floatStr);
			
		}
		return floatStr;
	}catch(e){
		console.log("Error : "+e.toString());
		return floatStr;
	}
}

exports.getRealAmt = function(formatedAmt){
	try{
		console.log("***************************Get Real Amt***************************");
		var floatValue = formatedAmt;
		if(formatedAmt.length>0){
			var floatStr= Number(formatedAmt).toString();
			floatValue = floatStr.substr(0,floatStr.length-2)+"."+floatStr.substr(floatStr.length-2);
		}
		return floatValue;
	}catch(e){
		console.log("Error : "+e.toString());
		return formatedAmt ;
	}
}

exports.visualRecognition = function(){
    console.log("visualRecognition");
   try{
	   //https://gateway-a.watsonplatform.net/visual-recognition/api/v3/detect_faces?api_key=5d3158bfb0629bdd1f579ba7e5cc639021375d8d&version=2016-05-20&url=https://drive.google.com/file/d/1C4X9ZMZDnybivJttJ0vUqSF2D--LbuaqKw/view?usp=sharing
       var visual_recognition = new VisualRecognitionV3({
         api_key: '5d3158bfb0629bdd1f579ba7e5cc639021375d8d',
         version_date: '2016-05-20'
       });
       
       var params = {
         images_file: fs.createReadStream('./image/myImage.jpg')
       };
       console.log(visual_recognition);
       console.log(params);
       visual_recognition.detectFaces(params, function(err, res) {
         if (err){
        	 console.log(err);
             return err;
         }else {
        	 console.log(JSON.stringify(res, null, 2));
             return res;
         }
           
       });
   }catch(e){
        console.log('Error');
       console.log(e);
       return e;
   }
}
