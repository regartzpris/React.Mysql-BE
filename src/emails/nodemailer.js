const nodemailer = require('nodemailer')



transporter.sendMail(mail, (err, res) => {
    if (err) return console.log(err.message)

    res.send('email berhasil di kirim')
})