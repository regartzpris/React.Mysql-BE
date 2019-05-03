const nodemailer = require('nodemailer')
const path = require('path')
const Handlebars = require('handlebars')
const pdf = require('html-pdf')
const fs = require('fs')


const parentPath = path.join(_dirname, '../..')
const fileDir = path.join(parentPath, '/src/uploads') // tempat file,photo,html

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


const createPdf = (username, name, email, fnSendEmail) => {
    var source = `
<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
</head>
<body>
    <div class="container">
        <p class="display-4 d-flex justify-content-between border-bottom">
            <span class="text-left">Invoice</span>
            <span class="text-right">#{{invoice}}</span>
        </p>
        <img src={{imgSrc}} alt="">
        <h1>Account Details</h1>
        <p>
            Username    : {{username}} <br>
            Name        : {{name}} <br>
            Email       : {{email}} <br>
            Plan        : <strong>Free</strong>
        </p>
    </div>
</body>
</html>
`

    var data = {
        "imgSrc": "http://icons.iconarchive.com/icons/iconka/meow/256/cat-clean-icon.png",
        "username": `${username}`,
        "name": `${name}`,
        "email": `${email}`
    }

    var template = Handlebars.compile(source) // compile teks html
    var result = template(data) // gabungkan object data dg template html

    fs.writeFileSync(`${fileDir}/result.html`, result) // path, template

    var htmls = fs.readFileSync(`${fileDir}/result.html`, 'utf8')

    var options = { format: 'Letter' }

    pdf.create(htmls, options).toFile(`${fileDir}/result.pdf`, (err, result) => {
        if (err) return console.log(err.message);

        fnSendEmail()
        console.log("PDF berhasil dibuat");

    })
}

const sendVerify = (username, name, email) => {
    const transEmail = () => {
        const mail = {
            from: 'Rochafi Alvin <rochafi.dev@gmail.com>',
            to: email,
            subject: 'Verifikasi Email',
            html: `<p>Hello ${name}, please click the link for verify your email</p>
            <a href='https://createbackend.herokuapp.com//verify?username=${username}'><h1>Verifikasi Email</h1></a>
            `,
            attachments: [{
                filename: `invoice.pdf`,
                path: `${fileDir}/result.pdf`,
                contentType: 'application/pdf'
            }]
        }
        transporter.sendMail(mail, (err, res) => {
            if (err) return console.log(err);

            console.log("Email berhasil terkirim");


        })
    }

    createPdf(username, name, email, transEmail)

}

module.exports = sendVerify

// const mail = {
//     from: 'Kila <ritongapriskila@gmail.com>',
//     to: 'zarfatritonga@gmail.com',
//     subject: 'Hola',
//     html: '<h1> Tester loh ini</h1>'
// }

// transporter.sendMail(mail, (err, res) => {
//     if (err) return console.log(err.message)

//     res.send('email berhasil di kirim')
// })