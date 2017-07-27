var client = require('./db_helper');
var sql =require('./sqlQuery');
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
//Create a token generator with the default settings:    
var randtoken = require('rand-token').generator({
  chars: '0-9'
});


var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({
	extended : false
});
router.use(jsonParser);
// app.use(express.static('tmp'));
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

function checkExist(queryStr, field1,field2){
	console.log('*********************Check Exist*******************************');
	var defered = Q.defer();
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			defered.reject(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+queryStr);
			connection.query(queryStr,
								[field1,field2],
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
router.post('/addCard', jsonParser, function(request, response) {
	console.log('*********************AddCard*******************************');
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Content-Type', 'application/json');
	response.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	var userID = request.body.userID;
	var cardNo = (request.body.cardNo).toString();
	var expiryDate = request.body.expiryDate; 
	var cardLast4Digit= cardNo.substr(cardNo.length-4);
	console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
	common.sequenceUniqueID().then(function(data){
		var rrn = data;
		var tokenRequestorID =randtoken.generate(11);
		var Active = 'Y';
		var createdDate = common.currentDateTime();
		client.getConnection(function(err, connection) {
			if (err) {
				console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
				response.send(common.responseMsg("01","db connection error",""));
			} else {
				checkExist(sql.selectCardToCheckExist,userID,cardLast4Digit).then(function(data){
					console.log(data.length);
					if(data.length==0){
							checkExist(sql.selectCardToCheckRrnExist,userID, rrn).then(function(data1){
								console.log("data1 :");
								console.log(data1.length);
									if(data1.length==0){
										console.log('Query : '+sql.insertCard);
											connection.query(
																sql.insertCard,
																[userID,cardLast4Digit,Active,rrn,createdDate],
																function(err, res) {
																	if (err) {
																		console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
																		response.send(common.responseMsg("02","query error",""));
																	} else {
																		console.log(res);
																		if(res.affectedRows>0){
																			var tranTimeStamp =dateFormat(new Date(),"yyyymmddHHMMss");
																			var transmissionDateTime =tranTimeStamp.substr(4);//"1115153447"//dateFormat(new Date(),"mmyyHHMMss");// 1115153447
																			var dateCapture = tranTimeStamp.substr(4,4);
																			var LocalTranDate = tranTimeStamp.substr(4,4);
																			var localTranTime = tranTimeStamp.substr(8);
																			console.log("tranTimeStamp :"+tranTimeStamp+"\n transmissionDateTime :"+transmissionDateTime+" \ndateCapture : "+tranTimeStamp.substr(4,4)+"\n localTranTime :"+tranTimeStamp.substr(8));
																			var XMLstr="<?xml version='1.0' encoding='UTF-8' ?>" +
																						"<TSPService  xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'" +
																						" xmlns='http://xml.netbeans.org/schema/TSPService'" +
																						" xsi:schemaLocation='http://xml.netbeans.org/schema/TSPService" +
																						" TSPReqType.xsd http://xml.netbeans.org/schema/TSPService" +
																						" TSPHeaderType.xsd http://xml.netbeans.org/schema/TSPService" +
																						" TSPResType.xsdhttp://xml.netbeans.org/schema/TSPServiceTSPService.xsd'>" +
																						"<Header>" +
																							"<Version>1.0</Version>" +
																							"<SrcApp>TSP</SrcApp>" +
																							"<TargetApp>DH</TargetApp>" +
																							"<SrcMsgId>00000001198469411500</SrcMsgId>" +
																							"<TranTimeStamp>"+tranTimeStamp+"</TranTimeStamp>" +
																						"</Header>" +
																						"<Body>" +
																							"<TSPReq>" +
																								"<PAN>"+cardNo+"</PAN>" +
																								"<ProcessingCode>A30000</ProcessingCode>" +
																								"<TransmissionDateTime>"+transmissionDateTime+"</TransmissionDateTime>" +
																								"<DateCapture>"+dateCapture+"</DateCapture>" +
																								"<MerchantType>5812</MerchantType>" +//5812 
																								"<POSEntryMode>010</POSEntryMode>" +
																								"<AcquiringInstitutionIdentificationCode>10011001222</AcquiringInstitutionIdentificationCode>" +
																								"<LocalTranTime>"+localTranTime+"</LocalTranTime>" +
																								"<LocalTranDate>"+LocalTranDate+"</LocalTranDate>" +
																								"<Track2Data>9566264329000000=121200000000000000</Track2Data>" +
																								"<MsgType>0100</MsgType>" +
																								"<SystemTraceAuditNumber>367103</SystemTraceAuditNumber>" +
																								"<CardAcceptorIdentificationCode>123897654546576</CardAcceptorIdentificationCode>" +
																								"<RRN>"+rrn+"</RRN>" +
																								"<CardAcceptTermID>12345678</CardAcceptTermID>" +
																								"<CardAcceptorNameLocation>UBI                   MUMBAI       MH 91</CardAcceptorNameLocation>" +
																								"<ExpirationDate>"+expiryDate+"</ExpirationDate>" +
																								"<PersonalIdentificationNumberData>99d7dd968ad469b4</PersonalIdentificationNumberData>" +
																								"<ReceivingInstitutionIdentificationCode>3</ReceivingInstitutionIdentificationCode>" +
																								"<RequestedTokenAssuranceLevel>00</RequestedTokenAssuranceLevel>" +
																								"<TokenRequestorID>12322197357</TokenRequestorID>" + //12301873408 12314881304
																								"<VersionNumber>456</VersionNumber>" +
																								"<TokenLocation>03</TokenLocation>" +
																								"<SharedKey>P1dYuet+h7p/5DABkPzhMiVlecGXTgKY</SharedKey>" +
																							"</TSPReq>" + //R22xk5pnb59v/Dpesyzq01sljqxt3xtdoo7czrpcoynnx17tsg6diq==  P1dYuet+h7p/5DABkPzhMiVlecGXTgKY																					 
 //VCEcyry8QT83s6E/b82MQ3ilmIyFVbgA


																						"</Body>" +
																						"</TSPService>";
																			
																			//s Muhil
//																			
																			//req id 12397877598

																			//BIN 429527 

																			//storage loc 03

																			//BIN  : 400001 and 429527

																			//PAN : 4000014557085122

																			//Expiry Date : 1121

																			//Token Storage Location : 03

																			//Channel : Mobile NFC(04) and ECOM (01)

																			//Requestor ID : 12351906124

																			//MCC : 5812, 3005 and 9399



																			//PAN 4237404557085124

																			//MCC 5812

																			//AcquiringInstitutionIdentificationCode 10011001222

																			//TokenRequestorID 12301873408

																			//ExpirationDate 1721


		//																	{"timestamp":"","message":"","source":"SYSTEM_01=NODE_01=SERVER_XML","responseRequired":"1","alternateDestArray":[],"alternateSrcArray":[],"uniqueId":"","destination":"SYSTEM_01=NODE_01=SERVER_TKN_XML"}
																			 	
																			
//e muhil
																			 console.log('Time: '+ common.currentDateTime()+'\n XMLstr : '+XMLstr);
																			var encoded = base64.encode(XMLstr);
																			//s Muhil 

																			encoded = "{'timestamp':'"+ tranTimeStamp +"','message':'" + encoded +"','source':'LX62=TEST_TOKEN_NODE=RQSTR_HTTP_SERVER_TEST_XML_ONE','responseRequired':'1','alternateDestArray':[],'alternateSrcArray':[],'uniqueId':'','destination':'LX62=TEST_TOKEN_NODE=RQSTR_HTTP_SERVER_TEST_XML_ONE'}";
																			//e Muhil 
																			 console.log('Time: '+ common.currentDateTime()+'\n Encoded : '+encoded);
																			reqst.post({
																                uri: common.serverUrl+'',
																                timeout: 10000,
																                followRedirect: true,
																                maxRedirects: 10,
																                body : encoded,
																                headers: {'Content-Type': 'application/json'} //'application/base64' x-www-form-urlencoded}
																            }, function(error, res, body) {
																            	console.log('error' + error);
																            	console.log('body' + body);
																            	console.log('res' + res);
																            	console.log('formatted res' + JSON.stringify(res));
																            	
																                 if (error) {
																                	 console.log('Time: '+ common.currentDateTime()+'\n Error : '+JSON.stringify(error));
																                	deleteCardInfo(userID,cardLast4Digit).then(function(data){
													                	    			if(data=="deleted"){
													                	    				console.log('Time: '+ common.currentDateTime()+'\n Response : '+'Card Deleted');
													                	    				response.send(common.responseMsg("07","tsp connection error",""));
													                	    			}else{
													                	    				console.log('Time: '+ common.currentDateTime()+'\n Response : '+'Card Delete Failed');
													                	    				response.send(common.responseMsg("07","tsp connection error",""));
													                	    			}
													                	    		},function(err){
													                	    			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
															                	    	response.send(err);
													                	    		});
																                } else if(body) {
																                	console.log('body');
																                	//s Muhil
																                	var decodedXML="";
																                	if(body !=""){
																                		var parsedBody = JSON.parse(body);
																	                	decodedXML = base64.decode(parsedBody.message)
																                	
																	                	console.log('Time: '+ common.currentDateTime()+'\n decodedXML : '+decodedXML);
																	                	xmlreader.read(decodedXML, function (err, res){
																	                	    if(err){
																	                	    	console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
																	                	    	response.send(common.responseMsg("08","XML reader error",""));
																	                	    }else{
																	                	    	try{
																	                	    		
																		                	    	console.log(res.TSPService.Body.at(0).TSPRes.at(0).ResponseCode.text());
																		                	    	if(res.TSPService.Body.at(0).TSPRes.at(0).ResponseCode.text()=="00"){
																		                	    		var tokens = res.TSPService.Body.at(0).TSPRes.at(0).Token.text();
																		                	    		var provisionID = res.TSPService.Body.at(0).TSPRes.at(0).TokenReferenceID.text();
																		                	    		var enrolledID = res.TSPService.Body.at(0).TSPRes.at(0).EnrollmentID.text();
																		                	    		var tspResponseDateTime = common.currentDateTime();
																		                	    		updateCardToken(tokens,provisionID,enrolledID,tspResponseDateTime,cardLast4Digit,userID).then(function(data){
																		                	    			if(data=="updated"){
																		                	    				console.log('Time: '+ common.currentDateTime()+'\n Response : success');
																		                	    				response.send(common.responseMsg("00","success",""));
																		                	    			}else{
																		                	    				console.log('Time: '+ common.currentDateTime()+'\n Response : '+'Token Update Failed');
																		                	    				response.send(common.responseMsg("09","token request failed",""));
																		                	    			}
																		                	    		}, function(err){
																		                	    			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
																				                	    	response.send(err);
																		                	    		});
																		                	    	}else{
																		                	    		deleteCardInfo(userID,cardLast4Digit).then(function(data){
																		                	    			if(data=="deleted"){
																		                	    				console.log('Time: '+ common.currentDateTime()+'\n Response : '+'Card Deleted');
																		                	    				response.send(common.responseMsg("09","token request failed",""));
																		                	    			}else{
																		                	    				console.log('Time: '+ common.currentDateTime()+'\n Response : '+'Card Delete Failed');
																		                	    				response.send(common.responseMsg("09","token request failed",""));
																		                	    			}
																		                	    		},function(err){
																		                	    			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
																				                	    	response.send(err);
																		                	    		});
																		                	    	}
																	                	    	}catch(e){
																	                	    		deleteCardInfo(userID,cardLast4Digit).then(function(data){
																	                	    			if(data=="deleted"){
																	                	    				console.log('Time: '+ common.currentDateTime()+'\n Response : '+'Card Deleted');
																	                	    				response.send(common.responseMsg("09","token request failed",""));
																	                	    			}else{
																	                	    				console.log('Time: '+ common.currentDateTime()+'\n Response : '+'Card Delete Failed');
																	                	    				response.send(common.responseMsg("09","token request failed",""));
																	                	    			}
																	                	    		},function(err){
																	                	    			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
																			                	    	response.send(err);
																	                	    		});
																	                	    	}
																	                	    }
																	                	    
																	                	});
																                	}else{
																                		deleteCardInfo(userID,cardLast4Digit).then(function(data){
														                	    			if(data=="deleted"){
														                	    				console.log('Time: '+ common.currentDateTime()+'\n Response : '+'Card Deleted');
														                	    				response.send(common.responseMsg("09","token request failed",""));
														                	    			}else{
														                	    				console.log('Time: '+ common.currentDateTime()+'\n Response : '+'Card Delete Failed');
														                	    				response.send(common.responseMsg("09","token request failed",""));
														                	    			}
														                	    		},function(err){
														                	    			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
																                	    	response.send(err);
														                	    		});
																                	}
																                	//e
																                }
																            });
																		}
																	}
															});
											connection.release();
							     }else{
							    	 console.log('Time: '+ common.currentDateTime()+'\n Response : '+'rrn exist');
							    	 response.send(common.responseMsg("10","rrn exists",""));
								 }
						   },function(err){
							   console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
								response.send(err);
						   })
					}else{
						 console.log('Time: '+ common.currentDateTime()+'\n Response : '+'card exist');
						 response.send(common.responseMsg("11","card exists",""));
					 }
			  },function(err){
				  console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
				  response.send(err);
			   })
			}
		});
 })

})	
router.post('/processForDetokenization', jsonParser, function(request, response) {
		console.log('*********************Process For Detokenization*******************************');
		response.setHeader('Access-Control-Allow-Origin', '*');
		response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
		response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
		response.setHeader('Access-Control-Allow-Credentials', true);
		response.setHeader('Content-Type', 'application/json');
		response.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
		var tokenReferenceID =request.body.provisionID;//"554d11ba586945e0"// request.body.provisionID;
		var tokens=request.body.tokens;//"8963527055176424"//"8963527134467133"//request.body.tokens;
		var tranAmt =common.getFormatedAmt(request.body.tranAmt);//"000000001012" //request.body.tranAmt;//000000001000
		console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
		console.log('*********************Cryptogram*******************************');
		common.sequenceUniqueID().then(function(data){
			var rrn = data;
			var tranTimeStamp = dateFormat(new Date(),"yyyymmddHHMMss");
			var transmissionDateTime =tranTimeStamp.substr(4);// 1115153447
			var dateCapture = tranTimeStamp.substr(4,4);
			var LocalTranDate = tranTimeStamp.substr(4,4);
			var localTranTime = tranTimeStamp.substr(8);
			console.log("tokenReferenceID :"+tokenReferenceID+"\n tokens :"+tokens+"\n tranAmt :"+tranAmt);
			console.log("rrn :"+rrn+"\n TranTimeStamp :"+tranTimeStamp+"\n transmissionDateTime :"+transmissionDateTime+" \n dateCapture : "+dateCapture+"\n localTranTime :"+localTranTime);
			var XMLCryptoGramstr="<?xml version='1.0' encoding='UTF-8' ?>" +
										"<TSPService xmlns='http://xml.netbeans.org/schema/TSPService'>" +
											"<Header>" +
												"<Version>1.0</Version>" +
												"<SrcApp>TSP</SrcApp>" +
												"<TargetApp>DH</TargetApp>" +
												"<SrcMsgId>00000001198469411500</SrcMsgId>" +
												"<TranTimeStamp>"+tranTimeStamp+"</TranTimeStamp>" +
											"</Header>" +
											"<Body>" +
												"<TSPReq>" +
													"<MsgType>0100</MsgType>" +
													"<ProcessingCode>A40000</ProcessingCode>" +
													"<TransmissionDateTime>"+transmissionDateTime+"</TransmissionDateTime>" +
													"<SystemTraceAuditNumber>436685</SystemTraceAuditNumber>" +
													"<LocalTranTime>"+localTranTime+"</LocalTranTime>" +
													"<LocalTranDate>"+LocalTranDate+"</LocalTranDate>" +
													"<DateCapture>"+dateCapture+"</DateCapture>" +
													"<MerchantType>1003</MerchantType>" +
													"<POSEntryMode>010</POSEntryMode>" +
													"<AcquiringInstitutionIdentificationCode>68478426931</AcquiringInstitutionIdentificationCode>" +
													"<RRN>"+rrn+"</RRN>" +
													"<CardAcceptTermID>12345678</CardAcceptTermID>" +
													"<CardAcceptorNameLocation>UBI                   MUMBAI       MH 91</CardAcceptorNameLocation>" +
													"<AcquiringInstitutionCountryCode>356</AcquiringInstitutionCountryCode>" +
													"<TranAmt>"+tranAmt+"</TranAmt>" +
													"<TranCurrCode>356</TranCurrCode>" +
													"<CardAcceptorIdentificationCode>123897654546576</CardAcceptorIdentificationCode>" +
													"<VersionNumber>456</VersionNumber>" +
													"<TokenRequestorID>12314881304</TokenRequestorID>" +
													"<TokenReferenceID>"+tokenReferenceID+"</TokenReferenceID>" +
												"</TSPReq>" +
											"</Body>" +
										"</TSPService>"
											console.log("Hai");
			console.log('Time: '+ common.currentDateTime()+'\n XMLCryptoGramstr : '+XMLCryptoGramstr);
			var encodedXMLCryptoGramstr = base64.encode(XMLCryptoGramstr);
			encodedXMLCryptoGramstr = "{'timestamp':'"+ tranTimeStamp +"','message':'" + encodedXMLCryptoGramstr +"','source':'LX62=TEST_TOKEN_NODE=RQSTR_HTTP_SERVER_TEST_XML_ONE','responseRequired':'1','alternateDestArray':[],'alternateSrcArray':[],'uniqueId':'','destination':'LX62=TEST_TOKEN_NODE=RQSTR_HTTP_SERVER_TEST_XML_ONE'}";
			console.log('Time: '+ common.currentDateTime()+'\n encodedXMLCryptoGramstr : '+encodedXMLCryptoGramstr);
			reqst.post({
                uri: common.serverUrl+'',
                timeout: 10000,
                followRedirect: true,
                maxRedirects: 10,
                body : encodedXMLCryptoGramstr,
                headers: {'Content-Type':'application/json'} // 'application/base64'}
            }, function(error, res, body) {
            	
               /*  if (error) {
                	 console.log('Time: '+ common.currentDateTime()+'\n Error : '+JSON.stringify(error));
                	 console.log('Time: '+ common.currentDateTime()+'\n Response : '+'cryptogram connection error');
	    			 response.send(common.responseMsg("16","cryptogram connection error",""));
                 }else if(body) {
	                	var decodedXMLCryptoGramstr = base64.decode(body);
	                	console.log('Time: '+ common.currentDateTime()+'\n decodedXMLCryptoGramstr : '+decodedXMLCryptoGramstr);
	                	xmlreader.read(decodedXMLCryptoGramstr, function (err, res){
	                	    if(err){
	                	    	console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
	                	    	response.send(common.responseMsg("08","XML reader error",""));
	                	    }else{
	                	    	try{*/
	                	    		var tokenCryptogram="94B290949B8F0B27";
	                	    		
		                	    	/*console.log(res.TSPService.Body.at(0).TSPRes.at(0).ResponseCode.text());
		                	    	if(res.TSPService.Body.at(0).TSPRes.at(0).ResponseCode.text()=="00"){
		                	    		var tokenCryptogram = res.TSPService.Body.at(0).TSPRes.at(0).TOKENCRYPTOGRAM.text();
		                	    		console.log('Time: '+ common.currentDateTime()+'\n Response : success');
                	    				response.send(common.responseMsg("00","success",""));
		                	    	}else{
		                	    		console.log('Time: '+ common.currentDateTime()+'\n Response : '+'cryptogram request failed');
		                	    		response.send(common.responseMsg("17","cryptogram request failed",""));
		                	    	}*/
	                	    		console.log('*********************Detokenization*******************************');
	                	    		common.sequenceUniqueID().then(function(res){
	                	    			/* rrn = res;
	                	    			 tranTimeStamp = dateFormat(new Date(),"yyyymmddHHMMss");
	                	    			 transmissionDateTime =tranTimeStamp.substr(4);// 1115153447
	                	    			 dateCapture = tranTimeStamp.substr(4,4);
	                	    			 LocalTranDate = tranTimeStamp.substr(4,4);
	                	    			 localTranTime = tranTimeStamp.substr(8);
	                	    			console.log("rrn :"+rrn+"\n TranTimeStamp :"+tranTimeStamp+"\n transmissionDateTime :"+transmissionDateTime+" \n dateCapture : "+transmissionDateTime.substr(1,4)+"\n localTranTime :"+transmissionDateTime.substr(5,10));*/
	                	    		var XMLDetokenizationStr="<?xml version='1.0' encoding='UTF-8' ?>" +
							   								 "<TSPService xmlns='http://xml.netbeans.org/schema/TSPService'>" +
								    								 "<Header>" +
							   	    								 "<Version>1.0</Version>" +
							   	    								 "<SrcApp>TSP</SrcApp>" +
							   	    								 "<TargetApp>DH</TargetApp>" +
							   	    								 "<SrcMsgId>00000001198469411500</SrcMsgId>" +
							   	    								 "<TranTimeStamp>"+tranTimeStamp+"</TranTimeStamp>" +
								    								 "</Header>" +
								    								 "<Body>" +
							   	    								 "<TSPReq>" +
							       	    								 "<MsgType>0100</MsgType>" +
							       	    								 "<PAN>"+tokens+"</PAN>" +
							       	    								 "<ProcessingCode>330000</ProcessingCode>" +
							       	    								 "<TransmissionDateTime>"+transmissionDateTime+"</TransmissionDateTime>" +
							       	    								 "<SystemTraceAuditNumber>607830</SystemTraceAuditNumber>" +
							       	    								 "<LocalTranTime>"+localTranTime+"</LocalTranTime>" +
							       	    								 "<LocalTranDate>"+LocalTranDate+"</LocalTranDate>" +
							       	    								 "<ExpirationDate>1801</ExpirationDate>" +
							       	    								 "<DateCapture>"+dateCapture+"</DateCapture>" +
							       	    								 "<MerchantType>1003</MerchantType>" +
							       	    								 "<POSEntryMode>010</POSEntryMode>" +
							       	    								 "<AcquiringInstitutionIdentificationCode>12398745621</AcquiringInstitutionIdentificationCode>" +
							       	    								 "<RRN>"+rrn+"</RRN>" +
							       	    								 "<CardAcceptTermID>12345679</CardAcceptTermID>" +
							       	    								 "<CardAcceptorNameLocation>UBI                   MUMBAI       MH 91</CardAcceptorNameLocation>" +
							       	    								 "<AcquiringInstitutionCountryCode>455</AcquiringInstitutionCountryCode>" +
							       	    								 "<MessageReasonCode>00</MessageReasonCode>" +
							       	    								 "<AdviceReasonCode>0101102012030100601607017</AdviceReasonCode>" +
							       	    								 "<Terminaltype>1</Terminaltype>" +
							       	    								 "<TerminalEntryCapability>2</TerminalEntryCapability>" +
							       	    								 "<ChipConditionCode>0</ChipConditionCode>" +
							       	    								 "<ChipTransactionIndicator>6</ChipTransactionIndicator>" +
							       	    								 "<ChipAuthenticationReliabilityIndicator>7</ChipAuthenticationReliabilityIndicator>" +
							       	    								 "<TOKENCRYPTOGRAM>"+tokenCryptogram+"</TOKENCRYPTOGRAM>" +
							       	    								 "<NetworkIdentificationCode>0000</NetworkIdentificationCode>" +
							       	    								 "<NetworkManagementInformationCode>105</NetworkManagementInformationCode>" +
							       	    								 "<TranAmt>"+tranAmt+"</TranAmt>" +
							       	    								 "<TranCurrCode>356</TranCurrCode>" +
							       	    								 "<CardAcceptorIdentificationCode>123897654546576</CardAcceptorIdentificationCode>" +
							       	    								 "<VersionNumber>456</VersionNumber>" +
							       	    								 "<TokenRequestorID>12322197357</TokenRequestorID>" +
							       	    								 "<Cardholderdata>123</Cardholderdata>" +
							       	    								"<SharedKey>P1dYuet+h7p/5DABkPzhMiVlecGXTgKY</SharedKey>" +
							   	    								 "</TSPReq>" +
								    								 "</Body>" +
							   								 "</TSPService>"
				    								    console.log('Time: '+ common.currentDateTime()+'\n XMLDetokenizationStr : '+XMLDetokenizationStr);
				    									var encodedXMLDetokenizationstr = base64.encode(XMLDetokenizationStr);
				    									encodedXMLDetokenizationstr = "{'timestamp':'"+ tranTimeStamp +"','message':'" + encodedXMLDetokenizationstr +"','source':'LX62=TEST_TOKEN_NODE=RQSTR_HTTP_SERVER_TEST_XML_ONE','responseRequired':'1','alternateDestArray':[],'alternateSrcArray':[],'uniqueId':'','destination':'LX62=TEST_TOKEN_NODE=RQSTR_HTTP_SERVER_TEST_XML_ONE'}";
				    									console.log('Time: '+ common.currentDateTime()+'\n encodedXMLDetokenizationstr : '+encodedXMLDetokenizationstr);
				    									reqst.post({
				    						                uri: common.serverUrl+'',
				    						                timeout: 10000,
				    						                followRedirect: true,
				    						                maxRedirects: 10,
				    						                body : encodedXMLDetokenizationstr,
				    						                headers: {'Content-Type': 'application/json'} //'application/base64'}
				    						            }, function(error, res, body) {
				    						            	console.log('Time: '+ common.currentDateTime()+'\n Body : '+JSON.stringify(body));
				    						            	console.log('Time: '+ common.currentDateTime()+'\n res : '+JSON.stringify(res));
				    						                 if (error) {
				    						                	 console.log('Time: '+ common.currentDateTime()+'\n Error : '+JSON.stringify(error));
				    						                	 console.log('Time: '+ common.currentDateTime()+'\n Response : '+'detokenization connection error');
				    							    			 response.send(common.responseMsg("18","detokenization connection error",""));
				    						                 }else if(body) {
				    							                	var decodedXMLDetokenizationstr="";
												                	if(body !=""){
												                		var parsedBody = JSON.parse(body);
													                	decodedXMLDetokenizationstr = base64.decode(parsedBody.message)
					    							                	console.log('Time: '+ common.currentDateTime()+'\n decodedXMLDetokenizationstr : '+decodedXMLDetokenizationstr);
													                	try{
						    							                	xmlreader.read(decodedXMLDetokenizationstr, function (err, res){
														                	    if(err){
														                	    	console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
														                	    	response.send(common.responseMsg("08","XML reader error",""));
														                	    }else{
														                	    	try{
															                	    	console.log(res.TSPService.Body.at(0).TSPRes.at(0).ResponseCode.text());
															                	    	if(res.TSPService.Body.at(0).TSPRes.at(0).ResponseCode.text()=="00"){
															                	    		var tokens = res.TSPService.Body.at(0).TSPRes.at(0).TokenNumber.text();
															                	    		var pan = res.TSPService.Body.at(0).TSPRes.at(0).PAN.text();
															                	    		var amt =common.getRealAmt(res.TSPService.Body.at(0).TSPRes.at(0).TranAmt.text());
															                	    		console.log('Time: '+ common.currentDateTime()+'\n Response :'+ JSON.stringify({"tokens":tokens,"pan":pan,"amt":amt}));
													                	    				response.send(common.responseMsg("00","success",[{"tokens":tokens,"pan":pan,"amt":amt}]));
															                	    	}else{
															                	    		console.log('Time: '+ common.currentDateTime()+'\n Response :'+ 'detokenization  request failed');
													                	    				response.send(common.responseMsg("19","detokenization  request failed",[{"responseCode":res.TSPService.Body.at(0).TSPRes.at(0).ResponseCode.text()}]));
															                	    	}
														                	    	}catch(e){
														                	    		console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(e));
														                	    		response.send(common.responseMsg("19","detokenization  request failed",""));
														                	    	}
														                	    }
						    							                	});
													                	}catch(e){
													                		console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(e));
											                	    		response.send(common.responseMsg("19","detokenization  request failed",""));
													                	}
				    							                	
				    							                	
												                	}
				    						                 }
				    						            });
	                	    		});
	                	    	/*}catch(e){
	                	    		console.log('Time: '+ common.currentDateTime()+'\n Response : '+'cryptogram request failed');
	                	    		response.send(common.responseMsg("17","cryptogram request failed",""));
	                	    	}
	                	    }
	                	    
	                	});
                 }*/
            });
		});
})	
function updateCardToken(tokens,provisionID,enrolledID,tspResponseDateTime,cardLast4Digit,userID){
	console.log('*********************Update CardToken*******************************');
	var defered = Q.defer();
	var modifyDate = common.currentDateTime();
	client.getConnection(function(err, connection) {
		if (err) {
			console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
			defered.reject(common.responseMsg("01","db connection error",""));
		} else {
			console.log('Query : '+sql.updateCardToken);
			connection.query(
					sql.updateCardToken,
					[tokens,provisionID,enrolledID,tspResponseDateTime,modifyDate,userID,cardLast4Digit],
					function(err, res) {
						if(err){
							console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
							defered.reject(common.responseMsg("02","query error",""));
						}else{
							if(res.affectedRows>0){
							 console.log('Time: '+ common.currentDateTime()+'\n Response : '+'updated');
							 defered.resolve('updated');
							}else{
								 console.log('Time: '+ common.currentDateTime()+'\n Response : '+'failed');
								defered.resolve('failed');
							}
							
						}
					})
		}
	});
	return defered.promise;
}
 function deleteCardInfo(userID,cardLast4Digit){
	 console.log('*********************Delete CardInfo*******************************');
	 var defered = Q.defer();
	 client.getConnection(function(err, connection) {
			if (err) {
				console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
				defered.reject(common.responseMsg("01","db connection error",""));
			} else {
				console.log('Query : '+sql.deleteCard);
				connection.query(
						sql.deleteCard,
						[userID,cardLast4Digit],
						function(err, res) {
							if(err){
								console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
								defered.reject(common.responseMsg("02","query error",""));
							}else{
								if(res.affectedRows>0){
									console.log('Time: '+ common.currentDateTime()+'\n Response : '+'deleted');
								    defered.resolve('deleted');
								}else{
									 console.log('Time: '+ common.currentDateTime()+'\n Response : '+'failed');
									 defered.resolve('failed');
								}
								
							}
						})
			}
	 })
	 return defered.promise;
 }
 
 router.post('/deactivateCard', jsonParser, function(request, response) {
	 	console.log('*********************DeactivateCard*******************************');
		response.setHeader('Access-Control-Allow-Origin', '*');
		response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
		response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
		response.setHeader('Access-Control-Allow-Credentials', true);
		response.setHeader('Content-Type', 'application/json');
		var Active = request.body.Active;
		var modifyDate = common.currentDateTime();
		var userID = request.body.userID;
		var cardLast4Digit = request.body.cardLast4Digit;
		console.log('Time: '+ common.currentDateTime()+"\n Request : "+JSON.stringify(request.body));
		client.getConnection(function(err, connection) {
			if (err) {
				console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
				response.send(common.responseMsg("01","db connection error",""));
			} else {
				console.log('Query : '+sql.deactivateCard);
				connection.query(
									sql.deactivateCard,
									[Active,modifyDate,userID,cardLast4Digit],
									function(err, res) {
										if (err) {
											console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
											response.send(common.responseMsg("02","query error",""));
										} else {
											if(res.affectedRows>0){
												console.log('Time: '+ common.currentDateTime()+'\n Response : '+'dectivated');
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
	router.post('/getAllActiveCardByUserID', jsonParser, function(request, response) {
		console.log('*********************Get All Active Card By UserID*******************************');
		response.setHeader('Access-Control-Allow-Origin', '*');
		response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
		response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
		response.setHeader('Access-Control-Allow-Credentials', true);
		response.setHeader('Content-Type', 'application/json');
		response.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
		var userID = request.body.userID;
		console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
		client.getConnection(function(err, connection) {
			if (err) {
				console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
				response.send(common.responseMsg("01","db connection error",""));
			} else {
				console.log('Query : '+sql.selectAllActiveCardByUserID);
					connection.query(
										sql.selectAllActiveCardByUserID,
										[userID],
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
router.post('/getCardTokenByCardLast4DigitAndUserID', jsonParser, function(request, response) {
		console.log('*********************Get Card Token By CardLast4Digit And UserID*******************************');
		response.setHeader('Access-Control-Allow-Origin', '*');
		response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
		response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
		response.setHeader('Access-Control-Allow-Credentials', true);
		response.setHeader('Content-Type', 'application/json');
		response.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
		var userID = request.body.userID;
		var cardLast4Digit = request.body.cardLast4Digit;
		console.log('Time: '+ common.currentDateTime()+"\n Request : "+ JSON.stringify(request.body));
		client.getConnection(function(err, connection) {
			if (err) {
				console.log('Time: '+ common.currentDateTime()+'\n Response : '+JSON.stringify(err));
				response.send(common.responseMsg("01","db connection error",""));
			} else {
				console.log('Query : '+sql.selectCardTokenByCardLast4DigitAndUserID);
					connection.query(
										sql.selectCardTokenByCardLast4DigitAndUserID,
										[userID,cardLast4Digit],
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
	module.exports = router;