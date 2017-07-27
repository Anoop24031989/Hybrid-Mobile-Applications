var client = require('./db_helper');
var sql =require('./sqlQuery');
var common = require('./common');
var cors = require('cors')
var express = require('express');
var router = express.Router();
var path = require("path");
var Q = require('Q');
var util = require('util');
var logFile;
var logStdout;
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({
	extended : false
});
router.use(jsonParser);
// app.use(express.static('tmp'));
router.use(cors());
router.use(function timeLog (req, res, next) {
	
	common.createLog("masterInfo.log").then(function(res){
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
router.get('/getMaster', function(request, response) {
	console.log('*********************Get Master*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Content-Type', 'application/json');
	var resp = '';
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			response.send(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+sql.selectMaster);
			connection.query(sql.selectMaster,
					
								function(err, res) {
									if (err) {
										console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
										response.send(common.responseMsg("02","query error",""));
									} else {
										if(res.length>0){
											console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(res));
											response.send(common.responseMsg("00","success",res));
										} else{
											console.log('Time: '+ common.currentDateTime()+'\n Response : '+'no data found');
											response.send(common.responseMsg("15","no data found",""));
										}
									}
							});
			connection.release();
		}
	});
	
	/*res.sendFile(path.join(__dirname, 'Sample.htm'));*/
})
router.post('/getMasterByType', function(request, response) {
	console.log('*********************Get Master By Type*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Content-Type', 'application/json');
	var resp = '';
	var modeType = request.body.modeType; 
	console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			response.send(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+sql.selectMasterByType);
			connection.query(sql.selectMasterByType,
								[modeType],
								function(err, res) {
									if (err) {
										console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
										response.send(common.responseMsg("02","query error",""));
									} else {
										if(res.length>0){
											console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(res));
											response.send(common.responseMsg("00","success",res));
										} else{
											console.log('Time: '+ common.currentDateTime()+'\n Response : '+'no data found');
											response.send(common.responseMsg("15","no data found",""));
										}
									}
							});
			connection.release();
		}
	});
})
router.post('/getMasterByTypeAndId', function(request, response) {
	console.log('*********************Get Master By Type And Id*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Content-Type', 'application/json');
	var resp = '';
	var masterID = request.body.masterID;
	var modeType = request.body.modeType;
	console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			response.send(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+sql.selectMasterByTypeAndId);
			connection.query(sql.selectMasterByTypeAndId,
								[parseInt(masterID), modeType],
								function(err, res) {
									if (err) {
										console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
										response.send(common.responseMsg("02","query error",""));
									} else {
										if(res.length>0){
											console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(res));
											response.send(common.responseMsg("00","success",res));
										} else{
											console.log('Time: '+ common.currentDateTime()+'\n Response : '+'no data found');
											response.send(common.responseMsg("15","no data found",""));
										}
									}
							});
			connection.release();
		}
	});
})
function getMaxid(queryStr) {
	console.log('*********************Get Maxid*******************************');
	var defered = Q.defer();
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			defered.reject(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+queryStr);
			connection.query(queryStr,
					
								function(err, res) {
									if (err) {
										console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
										defered.reject(common.responseMsg("02","query error",""));
									} else {
										console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(res));
										defered.resolve(res)
									}
							});
			connection.release();
		}
	});
	return defered.promise;
}
function checkExist(queryStr, type, desc){
	console.log('*********************Check Exist*******************************');
	var defered = Q.defer();
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			defered.reject(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+queryStr);
			connection.query(queryStr,
								[type,desc],
								function(err, res) {
									if (err) {
										console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
										defered.reject(common.responseMsg("02","query error",""));
									} else {
										console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(res));
										defered.resolve(res)
									}
							});
			connection.release();
		}
	});
	return defered.promise;
}
router.post('/addMaster', jsonParser, function(request, response) {
	console.log('*********************Add Master*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Content-Type','application/json');
	var modeType = request.body.modeType;
	var descr = request.body.descr;
	var statusFlg = request.body.statusFlg;
	var createdDate = common.currentDateTime();
	console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			response.send(common.responseMsg("01","db connection error",""));
		} else {
			checkExist(sql.selectMasterToCheckExist,modeType,descr).then(function(data){
				if(data.length==0){
				getMaxid(sql.getMasterMaxId).then(function(res){
					var id;
					for (var entry of res.entries()) {
					    id = (entry[1].id)+1;
					}
					console.log('Query : '+sql.insertMaster);
					connection.query(
										sql.insertMaster,
										[id,modeType,descr,common.currentDateTime(),statusFlg],
										function(err, res) {
											if (err) {
												console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
												response.send(common.responseMsg("02","query error",""));
											} else {
												if(res.affectedRows>0){
													console.log('Time: '+ common.currentDateTime()+'\n Response : '+'success');
													response.send(common.responseMsg("00","success",""));
												}else{
													console.log('Time: '+ common.currentDateTime()+'\n Response : '+'failed');
													response.send(common.responseMsg("06","operation failed",""));
												}
											}
									});
					connection.release();
				}, function(err){
					console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
					response.send(err);
				})
			  } else{
				  console.log('Time: '+ common.currentDateTime()+'\n Response : '+'exist');
				  response.send(common.responseMsg("12","master exists",""));
			  }
			},function(err){
				console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
				response.send(err);
			})
		}
	});

})
router.post('/updateMaster', jsonParser, function(request, response) {
	console.log('*********************Update Master*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Content-Type','application/json');
	var resp = '';
	var masterID = request.body.masterID;
	var modeType = request.body.modeType;
	var descr = request.body.descr;
	var modifyDate = common.currentDateTime();
	console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			response.send(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+sql.updateMaster);
			connection.query(
								sql.updateMaster,
								[descr,modifyDate,masterID,modeType],
								function(err, res) {
									if (err) {
										console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
										response.send(common.responseMsg("02","query error",""));
									} else {
										console.log(res.affectedRows);
										if(res.affectedRows>0){
											console.log('Time: '+ common.currentDateTime()+'\n Response : '+'success');
											response.send(common.responseMsg("00","success",""));
										}else{
											console.log('Time: '+ common.currentDateTime()+'\n Response : '+'failed');
											response.send(common.responseMsg("06","operation failed",""));
										}
									}
							});
			connection.release();
		}
	});

})
router.post('/deleteMaster', jsonParser, function(request, response) {
	console.log('*********************Delete Master*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Content-Type','application/json');
	var resp = '';
	var masterID = request.body.masterID;
	var modeType = request.body.modeType;
	console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			response.send(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+sql.deleteMaster);
			connection.query(
								sql.deleteMaster,
								[masterID, modeType],
								function(err, res) {
									if (err) {
										console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
										response.send(common.responseMsg("02","query error",""));
									} else {
										console.log(res.affectedRows);
										if(res.affectedRows>0){
											console.log('Time: '+ common.currentDateTime()+'\n Response : '+'success');
											response.send(common.responseMsg("00","success",""));
										}else{
											console.log('Time: '+ common.currentDateTime()+'\n Response : '+'failed');
											response.send(common.responseMsg("06","operation failed",""));
										}
									}
							});
			connection.release();
		}
	});

})
module.exports = router;
