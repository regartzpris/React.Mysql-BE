const mysql = require('mysql')

const conn = mysql.createConnection({
    // user: 'kila',
    user: 'regartzpris',
    password: 'Mysql123',
    // host: 'localhost',
    host: 'db4free.net',
    // database: 'express',
    database: 'reactbackend',
    port: '3306'
})

module.exports = conn
