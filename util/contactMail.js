const mailer = require('nodemailer')
const {contact} = require('../util/contact_template')
const {thanks} = require('../util/thanks_template')
const {thanksForContact } = require('../util/thanks_response_template')

// incoming variable >>> 
// Name 
// Subject
// Message
// Email
// Phone

const sendContactMail = (data) => {
  const emailTo = [
    { email: process.env.email,
      subject:data.Subject||'Code Academy Contact' , 
      template: contact(data) },

    { email: data.Email, 
      subject:data.Subject||'Code Academy Contact' , 
      template: thanksForContact(data) }
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