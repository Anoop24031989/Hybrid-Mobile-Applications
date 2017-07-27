// autogenerated by sql-generate v1.5.0 on Tue Feb 28 2017 13:42:18 GMT+0530 (India Standard Time)

var sql = require('sql');


/**
 * SQL definition for test1.master_table
 */
exports.master_table = sql.define({
        name: 'master_table',
        columns: [
                { name: 'masterID' },
                { name: 'modeType' },
                { name: 'descr' },
                { name: 'createdDate' },
                { name: 'modifyDate' },
                { name: 'statusFlg'}
        ]
});


//now let's make a simple query

// Queries for master_table
exports.selectMaster = "Select masterID,modeType,descr,createdDate,modifyDate  from master_table";

exports.selectMasterByType = "Select masterID,descr from master_table where  modeType = ? and statusFlg='Y'";

exports.selectMasterByTypeAndId = "Select masterID,modeType,descr from master_table where masterID = ? and modeType = ? and statusFlg='Y'";

exports.selectMasterToCheckExist = "Select masterID,modeType,descr from master_table where modeType = ? and descr = ? and statusFlg='Y'"

exports.insertMaster = "INSERT INTO master_table(masterID,modeType,descr,createdDate, statusFlg) VALUE(?,?,?,?,?)";

exports.updateMaster ="UPDATE master_table SET descr = ?, modifyDate = ?  WHERE masterID = ? and modeType = ?";

exports.deleteMaster ="UPDATE master_table SET statusFlg = 'N' WHERE masterID = ? and modeType = ?";

exports.getMasterMaxId = "Select max(masterID) as id from master_table";

/**
 * SQL definition for test1.user_info
 */
exports.user_info = sql.define({
        name: 'user_info',
        columns: [
                { name: 'userID' },
                { name: 'rollID' },
                { name: 'emailid' },
                { name: 'fName' },
                { name: 'lName' },
                { name: 'mobileNo' },
                { name: 'Password' },
                { name: 'secQuestId' },
                { name: 'secAns' },
                { name: 'statusFlg' },
                { name: 'pwdExpDate' },
                { name: 'lockFlg' },
                { name: 'lastAccessDate' },
                { name: 'forceChangePwd' },
                { name: 'loginFailCount' },
                { name: 'pswdChangeDate' },
                { name: 'pswdDuration' },
                { name: 'gender' },
                { name: 'IMEI' },
                { name: 'deviceModel' },
                { name: 'ipAddress' },
                { name: 'platform' },
                { name: 'country' },
                { name: 'appVersion' },
                { name: 'playerID' },
                { name: 'accessMobNo' },
                { name: 'createdDate' },
                { name: 'modifyDate' },
                { name: 'userName'}
        ]
});

//Queries for user_info
exports.selectAllUserInfo = "Select  userID," +
										" userName," +
										"rollID," +
										" emailid," +
										" fName," +
										" lName," +
										" mobileNo," +
										" secQuestId," +
										" secAns," +
										" lockFlg," +
										" pwdExpDate," +
										" lastAccessDate," +
										" gender," +
										" deviceModel," +
										" ipAddress," +
										" platform," +
										" country," +
										" appVersion," +
										" playerID," +
										" uuid"+
										"accessMobNo from user_info";

exports.selectAllActiveUserInfo = "Select  userID,\
										  userName,\
										  rollID,\
										  emailid,\
										  fName,\
										  lName,\
										  mobileNo,\
										  secQuestId,\
										  secAns,\
										  lockFlg,\
										  pwdExpDate,\
										  lastAccessDate,\
										  gender,\
										  deviceModel,\
										  ipAddress,\
										  platform,\
										  country,\
										  appVersion,\
										  playerID,\
										  accessMobNo,\
										  uuid\
										  from user_info where statusFlg = 'Y'";

exports.selectUserToCheckUnameExist = "Select userID from user_info where  userName = ?  and statusFlg='Y'";

exports.selectUserToCheckEmailExist = "Select userID from user_info where emailid=?   and statusFlg='Y'";

exports.selectUserToCheckLocked ="Select userID, lockFlg from user_info where userName = ?   and statusFlg='Y'"

exports.selectUserPswdByUserId="Select userID, Password from user_info where userName=? and statusFlg='Y'";

exports.selectUserByUnameAndPswd = "Select userID," +
										" userName," +
										"rollID," +
										" emailid," +
										" fName," +
										" lName," +
										" mobileNo," +
										" secQuestId," +
										" secAns," +
										" lockFlg," +
										" pwdExpDate," +
										" lastAccessDate," +
										" gender," +
										" uuid,"+
										" deviceModel," +
										" ipAddress," +
										" platform," +
										" country," +
										" appVersion," +
										" playerID," +
										"accessMobNo  from user_info where userName=? and Password=? and statusFlg='Y'";
										  
exports.insertUser = "INSERT INTO user_info(\
											  userID,\
	                					      userName,\
											  rollID,\
											  emailid,\
											  fName,\
											  lName,\
											  mobileNo,\
											  Password,\
											  secQuestId,\
											  secAns,\
											  statusFlg,\
											  pwdExpDate,\
											  lockFlg,\
											  lastAccessDate,\
											  forceChangePwd,\
											  loginFailCount,\
											  pswdChangeDate,\
											  pswdDuration,\
											  gender,\
											  IMEI,\
											  deviceModel,\
											  ipAddress,\
											  platform,\
											  country,\
											  appVersion,\
											  playerID,\
											  accessMobNo,\
											  uuid,\
											  createdDate) VALUE(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

exports.updateUserPrimaryInfo ="UPDATE user_info SET rollID = ?," +
											"fName =?, " +
											"lName=?, " +
											"mobileNo=?, " +
											"gender=?, "+
											"statusFlg=?, " +
											"modifyDate=? " +
											"WHERE userID = ?";
											  
exports.updateLockFlg ="UPDATE user_info SET lockFlg = ?," +
											"modifyDate=? " +
											"WHERE userID = ?";

exports.updatePswd ="UPDATE user_info SET Password=?," +
												"pswdChangeDate = ?," +
												"pwdExpDate = ?," +
												"forceChangePwd= ?," +
												"pswdDuration=?," +
												"modifyDate=?" +
												"WHERE userID = ?";


exports.updateLastAccessDate ="UPDATE user_info SET  lastAccessDate=?," +
												"modifyDate=?" +
												"WHERE userID = ?";

exports.updateUserOneSignalDet ="UPDATE user_info SET IMEI = ?," +
													"uuid =?,"+
													"deviceModel = ?," +
													"ipAddress =?," +
													"platform=?," +
													"country=?," +
													"appVersion=?," +
													"playerID=?," +
													"accessMobNo=?," +
													"modifyDate=?" +
													"WHERE userID = ?";

exports.deleteUser ="UPDATE user_info SET  statusFlg=?," +
											"modifyDate=?" +
											"WHERE userID = ?";

exports.getUserMaxId = "Select max(userID) as id from user_info";


/**
 * SQL definition for test1.user_pswd_history
 */
exports.user_pswd_history = sql.define({
        name: 'user_pswd_history',
        columns: [
                { name: 'userId' },
                { name: 'pswd' },
                { name: 'pswdChangedDate' }
        ]
});


/**
 * SQL definition for test1.card_info
 */
exports.card_info = sql.define({
        name: 'card_info',
        columns: [
                { name: 'userID' },
                { name: 'cardLast4Digit' },
                { name: 'tokens' },
                { name: 'provisionID' },
                { name: 'enrolledID' },
                { name: 'Active' },
                { name: 'tspResponseDateTime' },
                { name: 'rrn' },
                { name: 'createdDate' },
                { name: 'modifyDate' }
        ]
});


//Queries for card_info
exports.selectAllCardByUserID ="Select userID,cardLast4Digit,tokens from card_info where userID=?"
	
exports.selectAllActiveCardByUserID ="Select userID,cardLast4Digit,tokens from card_info where userID=? and Active='Y'"
	
exports.selectCardToCheckExist ="Select userID,cardLast4Digit from card_info where userID=? and cardLast4Digit = ?"
	
exports.selectCardToCheckRrnExist="Select userID,rrn from card_info where userID=? and rrn = ?"
	
exports.selectCardTokenByCardLast4DigitAndUserID="Select tokens,provisionID, enrolledID from card_info where userID=? and cardLast4Digit = ? and Active='Y'"

exports.insertCard = "INSERT INTO card_info( userID," +
											" cardLast4Digit," +
											" Active," +
											" rrn," +
											" createdDate) VALUE(?,?,?,?,?)";

exports.updateCardToken ="UPDATE card_info SET  tokens=?," +
												"provisionID=?,"+
												"enrolledID=?,"+
												"tspResponseDateTime=?,"+
												"modifyDate=?" +
												"WHERE userID = ? and cardLast4Digit = ?";

exports.deactivateCard ="UPDATE card_info SET  Active=?," +
											"modifyDate=?" +
											"WHERE userID = ? and cardLast4Digit = ?";


exports.deleteCard="DELETE FROM card_info WHERE userID = ? and cardLast4Digit = ?";