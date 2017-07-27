var client = module.exports = require('mysql').createPool({
    host : '10.44.78.13',
    port : '3306',
    user : 'testuser1',
    password: 'testuser1',
    database: 'test1'
});



module.exports = client;
