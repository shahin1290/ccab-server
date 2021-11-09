const mailer = require('nodemailer')
const {contact} = require('../util/contact_template')
const {thanks} = require('../util/thanks_template')


const sendContactMail = (data) => {
  const emailTo = [
    { email: process.env.email,
      subject:data.subject||'Code Academy Contact' , 
      template: contact(data) },

    { email: data.email, 
      subject:data.subject||'Code Academy Contact' , 
      template: thanks(data) }
  ]

  const smtpTransport = mailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.email,
      pass: process.env.password
    }
  })

  emailTo.forEach((el) => {
    const mailOptions = {
      from: `"Codify Academy" ${process.env.email}`,
      to: el.email,
      subject: el.subject,
      html: el.template
    }

    smtpTransport.sendMail(mailOptions, (err, response) => {
      if (err) {
        console.log('err')
      } else {
        console.log('success')
      }
      smtpTransport.close()
    })
  })
}

module.exports = { sendContactMail }