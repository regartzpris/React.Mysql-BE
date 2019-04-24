const router = require('express').Router()
const bcrypt = require('bcryptjs')
const isEmail = require('validator/lib/isEmail')
const { sendVerify } = require('../emails/sendGrid')
const conn = require('../connection/connection')

const multer = require('multer')
const path = require('path') // Menentukan folder uploads
const fs = require('fs') // menghapus file gambar

const uploadDir = path.join(__dirname + '/../uploads') //path for upload

const storagE = multer.diskStorage({
    // Destination
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    // Filename
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.fieldname + path.extname(file.originalname))
    }
})

const upstore = multer({
    storage: storagE,
    limits: {
        fileSize: 10000000 // Byte
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) { // will be error if the extension name is not one of these
            return cb(new Error('Please upload image file (jpg, jpeg, or png)'))
        }

        cb(undefined, true)
    }
})


// post avatar
router.post('/upstore', upstore.single('avatar'), (req, res) => {
    const sql = `SELECT * FROM users WHERE username = ?`
    const sql2 = `UPDATE users SET avatar = '${req.file.filename}' where username='${req.body.uname}'`
    const data = req.body.uname

    conn.query(sql, data, (err, result) => {
        if (err) return res.send(err)

        conn.query(sql2, (err, result) => {
            if (err) return res.send(err)

            res.send({ filename: req.file.filename })
        })
    })
})






//get user by username include link avatar
router.get('/users/:username', (req, res) => {

    var sql = `SELECT * FROM users where username=?;`


    conn.query(sql, req.params.username, (err, result) => {
        if (err) {
            throw err
        }
        res.send({ user: result, photo: `http://localhost:2010/getavatar/${result[0].avatar}` })
    })
})


//path avatar
router.get('/getavatar/:pic', (req, res) => {
    res.sendFile(`${uploadDir}/${req.params.pic}`)
})



//delete avatar in sql and folder upload
router.delete('/upstore/:username', (req, res) => {


    const sql1 = `select * from users where username=?;`
    const sql = `UPDATE users SET avatar = null where username=?;`



    conn.query(sql1, req.params.username, (err, result) => {
        if (err) {
            res.send(err)
        }
        // console.log(result);
        fs.unlinkSync(`${uploadDir}/${result[0].avatar}`)

        conn.query(sql, req.params.username, (err, result) => {
            if (err) return res.send(err)

            res.status(200).send('avatar successful deleted')
        })

    })


})

//edit profile

// router.patch('/users/:username', (req, res) => {

//     Object.keys(req.body).forEach(key => {
//         if (!req.body[key]) {
//             delete req.body[key];
//         }
//     });
//     var data = {
//         username: req.body.username,
//         name: req.body.name,
//         password: req.body.password,
//         email: req.body.email,
//         avatar: req.body.avatar
//     }
//     const updates = Object.keys(req.body)  // array baru setelah filtering (delete)  
//     const allowedUpdates = ['name', 'email', 'password', 'username', 'avatar'] // field yang boleh di update
//     const isValidOperation = updates.every(update => allowedUpdates.includes(update)) // Check field yg di input user


//     var editUser = `UPDATE users SET ? WHERE username = ?`;
//     // var getUser = `SELECT * FROM users WHERE username = ?`;

//     conn.query(editUser, [data, req.params.username], (err, result) => {
//         if (err) {
//             return res.send(err);
//         }

//         res.send(result)
//     });
// });





router.post('/users', async (req, res) => { // CREATE USER
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



router.get('/verify', (req, res) => {
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







//users login
router.post('/users/login', (req, res) => {

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
router.delete('/users/:id', (req, res) => {
    var sql = `delete from users where id=?;`

    conn.query(sql, req.params.id, (err, result) => {
        if (err) { throw err }

        res.status(200).send("deleted user successfull")

    })
})


//input task
router.post('/task/', (req, res) => {

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
router.get('/task/:userid', (req, res) => {


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
router.delete('/task/:id', (req, res) => {

    var sql = `delete from task where id = ?`

    conn.query(sql, req.params.id, (err, result) => {
        if (err) { throw err }

        res.status(200).send("delete task successfull")
    })
})


module.exports = router