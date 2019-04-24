const mysql = require('mysql')

const conn = mysql.createConnection({
    user: 'kila',
    password: 'Mysql123',
    host: 'localhost',
    database: 'express',
    port: '3306'
})

module.exports = conn
