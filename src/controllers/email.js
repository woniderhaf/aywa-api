// plug-ins
const fetch = require('cross-fetch')
const nodemailer = require('nodemailer')
// helpers
const utils = require('../helpers/utils')

// config
const config = require('../config')

exports.main = async () => {
  let testEmailAccount = await nodemailer.createTestAccount()
  let transporter = nodemailer.createTransport({
    host: 'email',
    port: 587,
    secure: false,
    auth: {
      user: testEmailAccount.user, // generated ethereal user
      pass: testEmailAccount.pass, // generated ethereal password
    },
  })
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻"<nodejs@example.com>', // sender address
    to: 'physics56@bk.ru', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world?', // plain text body
    html: '<b>Hello world?</b>', // html body
  })
  console.log('Message sent: %s', info.messageId)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
  // Pr
}
