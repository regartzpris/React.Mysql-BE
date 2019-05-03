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
// router.get('/users/:username', (req, res) => {

//     var sql = `SELECT * FROM users where username=?;`


//     conn.query(sql, req.params.username, (err, result) => {
//         if (err) {
//             throw err
//         }
//         res.send({ user: result, photo: `http://localhost:2010/getavatar/${result[0].avatar}` })
//     })
// })


// //path avatar
router.get('/getavatar/:pic', (req, res) => {
    res.sendFile(`${uploadDir}/${req.params.pic}`)
})



//delete avatar in sql and folder upload
// router.delete('/upstore/:username', (req, res) => {


//     const sql1 = `select * from users where username=?;`
//     const sql = `UPDATE users SET avatar = null where username=?;`



//     conn.query(sql1, req.params.username, (err, result) => {
//         if (err) {
//             res.send(err)
//         }
//         // console.log(result);
//         fs.unlinkSync(`${uploadDir}/${result[0].avatar}`)

//         conn.query(sql, req.params.username, (err, result) => {
//             if (err) return res.send(err)

//             res.status(200).send('avatar successful deleted')
//         })

//     })


// })


// login
router.post('/users/login', (req, res) => { // LOGIN USER
    const { username, password } = req.body

    const sql = `SELECT * FROM users WHERE username = '${username}'`

    conn.query(sql, async (err, result) => {
        if (err) return res.send(err.message) // Error pada query SQL


        const user = result[0] // Result berupa array of object

        if (!user) return res.send("User not found") // User tidak ditemukan

        if (!user.verified) return res.send("Please, verify your email") // Belum verifikasi email

        const hash = await bcrypt.compare(password, user.password) // true / false

        if (!hash) return res.send("Wrong password") // Password salah

        res.send(user) // Kirim object user
    })
})


//read profile
router.get('/users/username', (req, res) => { // READ PROFILE
    const sql = `SELECT * FROM users WHERE username = ?`
    const data = req.query.uname

    conn.query(sql, data, (err, result) => {
        if (err) return res.send(err.message) // Error pada query SQL

        const user = result[0] // Result berupa array of object

        if (!user) return res.send("User not found") // User tidak ditemukan

        res.send({
            user,
            photo: `https://createbackend.herokuapp.com//${user.avatar}`
        })

    })

})


//get link image
router.get('/upstore/:imgName', (req, res) => { // ACCESS IMAGE
    const options = {
        root: uploadDir
    }

    var fileName = req.params.imgName

    res.sendFile(fileName, options, (err) => {
        if (err) return console.log(err);

        console.log('Sent: ', fileName);

    })
})


//edit/patch profile
router.patch('/users/:userid', (req, res) => { // UPDATE USER
    const sql = `UPDATE users SET ? WHERE id = ?`
    const data = [req.body, req.params.userid]

    conn.query(sql, data, (err, result) => {
        if (err) return res.send(err.mess)

        res.send(result)
    })
})


//delete avatar
router.delete('/upstore/delete', (req, res) => { // DELETE IMAGE ON FOLDER
    const sql = `SELECT avatar FROM users WHERE username = '${req.body.username}'` // Get avatar column from user
    const sql2 = `UPDATE users SET avatar = null WHERE username = '${req.body.username}'` // Set null on avatar column
    const sql3 = `SELECT * FROM users WHERE username = '${req.body.username}'` // Get updated user
    conn.query(sql, (err, result) => {
        if (err) return res.send(err)

        const avatar = result[0].avatar // Get avatar column

        const imgPath = uploadDir + avatar // File location

        fs.unlink(imgPath, err => { // Delete file avatar
            if (err) return res.send(err)

            conn.query(sql2, (err, result) => {
                if (err) return res.send(err)

                conn.query(sql3, (err, result) => {
                    if (err) return res.send(err)

                    res.send(result)
                })
            })

        })
    })


})








//register
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