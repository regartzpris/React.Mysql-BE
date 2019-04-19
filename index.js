const express = require('express')
const mysql = require('mysql')

const app = express()
const port = 2010


app.use(express.json())
const conn = mysql.createConnection({
    user: 'kila',
    password: 'Mysql123',
    host: 'localhost',
    database: 'mysqlexpress',
    port: '3306'
})

// Register
app.post('/users', (req, res) => {
    const { name, age, password, email } = req.body
    var sql = `INSERT INTO users (name, age,password,email) VALUES ('${name}', ${age},'${password}','${email}');`
    var sql2 = `SELECT * FROM users;`

    conn.query(sql, (err, result) => {
        if (err) { throw err }

        conn.query(sql2, (err, result) => {
            if (err) { throw err }

            res.send(result)
        })
    })
})

// Get users
app.get('/users', (req, res) => {
    // const{name,age,password,email}=req.body
    var sql = `SELECT * FROM users;`

    conn.query(sql, (err, result) => {
        if (err) {
            throw err
        }
        res.send(result)
    })
})

app.listen(port, () => {
    console.log('Api Running at', port);
})