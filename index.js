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
    const { nama, age, password, email } = req.body
    var sql = `INSERT INTO users (nama, age,password,email) VALUES ('${nama}', ${age},'${password}','${email}');`
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