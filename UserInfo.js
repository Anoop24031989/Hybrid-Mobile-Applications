var client = require('./db_helper');
var sql =require('./sqlQuery');
var common = require('./common');
var cors = require('cors')
var express = require('express');
var router = express.Router();
var path = require("path");
var Q = require('q');
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
	common.createLog("userInfo.log").then(function(res){
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
router.get('/getAllUserInfo', function(request, response) {
	console.log('*********************Get All User Info*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Content-Type', 'application/json');
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			response.send(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+sql.selectAllUserInfo);
			connection.query(sql.selectAllUserInfo,
					
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

router.get('/getAllActiveUserInfo', function(request, response) {
	console.log('*********************Get All Active User Info*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Content-Type', 'application/json');
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			response.send(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+sql.selectAllActiveUserInfo);
			connection.query(sql.selectAllActiveUserInfo,
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

function checkUserLocked(queryStr, uName){
	console.log('*********************Check User Locked*******************************');
	var defered = Q.defer();
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			defered.reject(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+queryStr);
			connection.query(queryStr,
								[uName],
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
router.post('/getUserByUnameAndPswd', function(request, response) {
	console.log('*********************Get User By Uname And Pswd*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Content-Type', 'application/json');
	response.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	var userName = request.body.userName;
	var Password = request.body.Password;
	console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			response.send(common.responseMsg("01","db connection error",""));
		} else {
			checkUserLocked(sql.selectUserToCheckLocked,userName).then(function(data){
				if(data.length!=0 && data[0].lockFlg=='N'){
					console.log('Query : '+sql.selectUserByUnameAndPswd);
					connection.query(sql.selectUserByUnameAndPswd,
										[userName,Password],
										function(err, res) {
											if (err) {
												console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
												response.send(common.responseMsg("02","query error",""));
											} else {
												if(res.length>0){
													console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(res));
													response.send(common.responseMsg("00","success",res));
												} else{
													console.log('Time: '+ common.currentDateTime()+'\n Response : '+'invalid username and password');
													response.send(common.responseMsg("14","invalid username and password",""));
												}
												
											}
									});
					connection.release();
				} else if(data.length==0){
					console.log('Time: '+ common.currentDateTime()+'\n Response : '+'no user found');
					response.send(common.responseMsg("13","no user found",""));
				}
				else{
					console.log('Time: '+ common.currentDateTime()+'\n Response : '+'locked');
					response.send(common.responseMsg("03","user locked",""));
				}
			}, function(err){
				console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
				response.send(err);
			});
		}
	});
})
router.post('/getUserPswdByUName', function(request, response) {
	console.log('*********************Get User Pswd By User Name*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Content-Type', 'application/json');
	response.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	var userName = request.body.userName;
	console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			response.send(common.responseMsg("01","db connection error",""));
		} else {
			checkUserLocked(sql.selectUserToCheckLocked,userName).then(function(data){
				if(data.length!=0 && data[0].lockFlg=='N'){
					console.log('Query : '+sql.selectUserByUnameAndPswd);
					connection.query(sql.selectUserPswdByUserId,
										[userName],
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
				} else if(data.length==0){
					console.log('Time: '+ common.currentDateTime()+'\n Response : '+'no user found');
					response.send(common.responseMsg("13","no user found",""));
				}
				else{
					console.log('Time: '+ common.currentDateTime()+'\n Response : '+'locked');
					response.send(common.responseMsg("03","user locked",""));
				}
			}, function(err){
				console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
				response.send(err);
			});
		}
	});
})
function getMaxid(queryStr) {
	console.log('*********************Get Max id*******************************');
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
function checkExist(queryStr, field){
	console.log('*********************Check Exist*******************************');
	var defered = Q.defer();
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			defered.reject(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+queryStr);
			connection.query(queryStr,
								[field],
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
router.post('/addUser', jsonParser, function(request, response) {
	console.log('*********************Add User*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Content-Type', 'application/json');
	response.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	var rollID = request.body.rollID;
	var userName= request.body.userName;
	var emailid = request.body.emailid;
	var fName = request.body.fName;
	var lName = request.body.lName;
	var mobileNo = request.body.mobileNo;
	var Password = request.body.Password;
	var secQuestId = request.body.secQuestId;
	var secAns = request.body.secAns;
	var statusFlg = 'Y';
	var pwdExpDate= common.getPasswordExpDate(common.currentDateTime());
	var lockFlg = 'N';
	var lastAccessDate = common.currentDateTime();
	var forceChangePwd = 0;
	var loginFailCount = 0;
	var pswdChangeDate = common.currentDateTime();
	var pswdDuration = 30;
	var gender = request.body.gender;
	var IMEI = request.body.IMEI;
	var deviceModel = request.body.deviceModel;
	var ipAddress = request.body.ipAddress;
	var platform = request.body.platform;
	var country = request.body.country;
	var appVersion = request.body.appVersion;
	var playerID =request.body.playerID;
	var accessMobNo = request.body.accessMobNo;
	var uuid = request.body.uuid;
	var createdDate = common.currentDateTime();
	console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			response.send(common.responseMsg("01","db connection error",""));
		} else {
			checkExist(sql.selectUserToCheckUnameExist,userName).then(function(data){
				if(data.length==0){
						checkExist(sql.selectUserToCheckEmailExist,emailid).then(function(data1){
								if(data1.length==0){
									getMaxid(sql.getUserMaxId).then(function(res){
										var id;
										for (var entry of res.entries()) {
										    id = (entry[1].id)+1;
										}
						
										console.log('Query : '+sql.insertUser);
										connection.query(
															sql.insertUser,
															[id,userName,rollID,emailid,fName,lName,mobileNo,Password,secQuestId,secAns,statusFlg,pwdExpDate,
															 lockFlg,lastAccessDate,forceChangePwd,loginFailCount,pswdChangeDate,pswdDuration, gender,IMEI, deviceModel,
															 ipAddress,platform,country,appVersion,playerID,accessMobNo,uuid,createdDate],
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
						     }else{
						    	 console.log('Time: '+ common.currentDateTime()+'\n Response : '+'email exist');
						    	 response.send(common.responseMsg("04","email exist",""));
							 }
					   },function(err){
						   console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
							response.send(err);
					   })
				}else{
					 console.log('Time: '+ common.currentDateTime()+'\n Response : '+'username exist');
					 response.send(common.responseMsg("05","username exist",""));
				 }
		  },function(err){
			  console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			  response.send(err);
		   })
		}
	});

})
router.post('/updateUserPrimaryInfo', jsonParser, function(request, response) {
	console.log('*********************Update User Primary Info*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Content-Type', 'application/json');
	var userID = request.body.userID;
	var rollID = request.body.rollID;
	var fName = request.body.fName;
	var lName = request.body.lName;
	var mobileNo = request.body.mobileNo;
	var gender = request.body.gender;
	var statusFlg = 'Y';
	var modifyDate = common.currentDateTime();
	console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			response.send(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+sql.updateUserPrimaryInfo);
				connection.query(
									sql.updateUserPrimaryInfo,
									[rollID,fName,lName,mobileNo,gender,statusFlg,modifyDate,userID],
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
		}
	});

})
router.post('/updateLockFlg', jsonParser, function(request, response) {
	console.log('*********************Update LockFlg*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Content-Type', 'application/json');
	var lockFlg = request.body.lockFlg;
	var modifyDate = request.body.modifyDate;
	var userID = request.body.userID;
	console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			response.send(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+sql.updateLockFlg);
			connection.query(
								sql.updateLockFlg,
								[lockFlg,modifyDate,userID],
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
		}
	});
	

})
router.post('/updatePswd', jsonParser, function(request, response) {
	console.log('*********************Update Pswd*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Content-Type', 'application/json');
	var Password = request.body.Password;
	var pswdChangeDate = common.currentDateTime();
	var pwdExpDate = common.getPasswordExpDate(common.currentDateTime());
	var forceChangePwd = request.body.forceChangePwd;
	var pswdDuration =30;
	var modifyDate = common.currentDateTime();
	var userID = request.body.userID
	console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			response.send(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+sql.updatePswd);
			connection.query(
								sql.updatePswd,
								[Password,pswdChangeDate,pwdExpDate,forceChangePwd,pswdDuration,modifyDate,userID],
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

router.post('/updateLastAccessDate', jsonParser, function(request, response) {
	console.log('*********************Update Last Access Date*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Content-Type', 'application/json');
	var lastAccessDate = common.currentDateTime();
	var modifyDate = common.currentDateTime();
	var userID = request.body.userID
	console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			response.send(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+sql.updateLastAccessDate);
			connection.query(
								sql.updateLastAccessDate,
								[lastAccessDate,modifyDate,userID],
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
		}
	});
	

})

router.post('/updateUserOneSignalDet', jsonParser, function(request, response) {
	console.log('*********************Update User OneSignalDet*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Content-Type', 'application/json');
	var IMEI = request.body.IMEI;
	var deviceModel = request.body.deviceModel;
	var ipAddress = request.body.ipAddress;
	var platform = request.body.platform;
	var country = request.body.country;
	var appVersion = request.body.appVersion;
	var playerID = request.body.playerID;
	var accessMobNo = request.body.accessMobNo;
	var uuid = request.body.uuid;
	var modifyDate = common.currentDateTime();
	var userID = request.body.userID;
	console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			response.send(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+sql.updateUserOneSignalDet);
			connection.query(
								sql.updateUserOneSignalDet,
								[IMEI,uuid,deviceModel,ipAddress,platform,country,appVersion,playerID,accessMobNo,modifyDate,userID],
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
		}
	});
	

})
router.post('/deleteUser', jsonParser, function(request, response) {
	console.log('*********************Delete User*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Content-Type', 'application/json');
	var statusFlg = request.body.statusFlg;
	var modifyDate = common.currentDateTime();
	var userID = request.body.userID;
	console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			response.send(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+sql.deleteUser);
			connection.query(
								sql.deleteUser,
								[statusFlg,modifyDate,userID],
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
		}
	});

})

module.exports = router;
