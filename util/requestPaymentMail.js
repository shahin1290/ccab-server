const mailer = require('nodemailer')
const { requestPayment } = require('../util/request_payment_template')

const sendRequestPaymentMail = (name, email) => {
  const smtpTransport = mailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.email,
      pass: process.env.password
    }
  })

  const requestPaymentTemplate = requestPayment(name)

  const mailOptions = {
    from: `"Codify Academy" ${process.env.email}`,
    to: email,
    subject: 'Payment Request',
    html: requestPaymentTemplate,
    text:requestPaymentTemplate
  }

  smtpTransport.sendMail(mailOptions, (err, response) => {
    if (err) {
      console.log('err',err)
    } else {
      console.log('success')
    }
    smtpTransport.close()
  })
}

module.exports = { sendRequestPaymentMail }
