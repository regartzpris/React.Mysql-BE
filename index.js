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

// Register/input
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

// Get all data
app.get('/users', (req, res) => {

    var sql = `SELECT * FROM users;`

    conn.query(sql, (err, result) => {
        if (err) {
            throw err
        }
        res.send(result)
    })
})

//users login
app.post('/users/login', (req, res) => {

    const { password, email } = req.body

    var sql = `select * from users ;`


    conn.query(sql, (err, result) => {
        if (err) {
            throw err
        } else {
            for (var i = 0; i < result.length; i++) {
                if (email === result[i].email && password === result[i].password) {
                    res.send(result[i])

                } else if (i === result.length - 1) {
                    // console.log('Login gagal');
                    res.status(404).send("email dan password salah atau tidak di temukan")
                }
            }
        }
    })
})

//delete user
app.delete('/users/:id', (req, res) => {
    var sql = `delete from users where id=?;`

    conn.query(sql, req.params.id, (err, result) => {
        if (err) { throw err }

        res.status(200).send("deleted successfull")

    })
})



app.listen(port, () => {
    console.log('Api Running at', port);
})