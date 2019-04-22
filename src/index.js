const express = require('express')
const mysql = require('mysql')
const bcrypt = require('bcryptjs')
const isEmail = require('validator/lib/isEmail')
const { sendVerify } = require('./emails/sendGrid')

const app = express()
const port = 2010

app.use(express.json())

const conn = mysql.createConnection({
    user: 'kila',
    password: 'Mysql123',
    host: 'localhost',
    database: 'express',
    port: '3306'
})

app.post('/users', async (req, res) => { // CREATE USER
    var sql = `INSERT INTO users SET ?;` // Tanda tanya akan digantikan oleh variable data
    var sql2 = `SELECT * FROM users;`
    var data = req.body // Object dari user {username, name, email, password}

    // validasi untuk email
    if (!isEmail(req.body.email)) return res.send("Email is not valid")
    // ubah password yang masuk dalam bentuk hash
    req.body.password = await bcrypt.hash(req.body.password, 8)

    conn.query(sql, data, (err, result) => {
        if (err) return res.send(err.sqlMessage) // Error pada post data

        sendVerify(req.body.username, req.body.name, req.body.email)

        conn.query(sql2, (err, result) => {
            if (err) return res.send(err) // Error pada select data

            res.send(result)
        })
    })
})



app.get('/verify', (req, res) => {
    const username = req.query.username
    const sql = `UPDATE users SET verified = true WHERE username = '${username}'`
    const sql2 = `SELECT * FROM users WHERE username = '${username}'`

    conn.query(sql, (err, result) => {
        if (err) return res.send(err.sqlMessage)

        conn.query(sql2, (err, result) => {
            if (err) return res.send(err.sqlMessage)

            res.send('<h1>Verifikasi berhasil</h1>')
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

        res.status(200).send("deleted user successfull")

    })
})


//input task
app.post('/task/', (req, res) => {

    const { keterangan, userid } = req.body

    var sql = `insert into task (keterangan,userid) values ('${keterangan}',${userid});`



    var sql2 = `select * from task;`



    conn.query(sql, (err, result) => {
        if (err) { throw err }

        conn.query(sql2, (err, result) => {
            if (err) { throw err }

            res.send(result)

        })
    })
})


//get own task
app.get('/task/:userid', (req, res) => {


    var sql = `select keterangan,nama,age,userid
    from task join users 
    on userid=users.id
    where userid=?;`

    conn.query(sql, [req.params.userid], (err, result) => {
        if (err) { throw err }

        res.send(result)
    })

})

//delete task
app.delete('/task/:id', (req, res) => {

    var sql = `delete from task where id = ?`

    conn.query(sql, req.params.id, (err, result) => {
        if (err) { throw err }

        res.status(200).send("delete task successfull")
    })
})
















app.listen(port, () => {
    console.log('Api Running at', port);
})