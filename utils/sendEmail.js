// sending email using gmail
'use strict'
const nodemailer = require('nodemailer')
const config = require('config')

const sendEmail = async (options) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: config.get('smtp_host'),
    port: config.get('smtp_port'),
    secure: false,
    requireTLS: true,
    service: 'gmail', //todo
    auth: {
      user: config.get('smtp_email'),
      pass: config.get('smtp_password'),
    },
  })

  transporter.verify((error, success) => {
    if (error) {
      console.log(error)
    } else {
      console.log(success)
    }
  })

  // send mail with defined transport object
  const message = {
    //todo use config later
    from: `${config.get('from_name')} <${config.get('from_email')}>`, // sender address
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  }

  const info = await transporter.sendMail(message)

  console.log('Message sent: %s', info.messageId)
}

module.exports = sendEmail
