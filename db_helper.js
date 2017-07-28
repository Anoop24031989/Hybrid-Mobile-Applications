/*var client = module.exports = require('mysql').createPool({
    host : '10.44.78.13',
    port : '3306',
    user : 'testuser1',
    password: 'testuser1',
    database: 'test1'
});*/
var client = module.exports = require('mysql').createPool({
    host : 'sql12.freemysqlhosting.net',
    port : '3306',
    user : 'sql12187524',
    password: 'cSi95BT321',
    database: 'sql12187524'
});


module.exports = client;
