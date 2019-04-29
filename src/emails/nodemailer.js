const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: 'ritongapriskila@gmail.com',
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
    }
})

const mail = {
    from: 'Kila <ritongapriskila@gmail.com>',
    to: 'zarfatritonga@gmail.com',
    subject: 'Hola',
    html: '<h1> Tester loh ini</h1>'
}

transporter.sendMail(mail, (err, res) => {
    if (err) return console.log(err.message)

    res.send('email berhasil di kirim')
})