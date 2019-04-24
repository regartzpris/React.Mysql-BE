const sgMail = require('@sendgrid/mail')
const sgAPIKey = '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'

sgMail.setApiKey(sgAPIKey)


const sendVerify = (username, name, email) => {
    sgMail.send({
        to: email,
        from: 'zarfatritonga@gmail.com',
        subject: "Verikasi Email",
        html: `<h1><a href='http://localhost:2010/verify?username=${username}'>Klik untuk verifikasi</a></h1>`
    })
}

module.exports = {
    sendVerify
}