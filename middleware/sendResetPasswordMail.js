var mailer = require('nodemailer')
const {
  passwordResetEmailTemplate
} = require('../util/password_reset_template')
let notErr = true

const sendResetPasswordMail = (res, user, link) => {
  const transporter = mailer.createTransport({
    service: 'gmail',
    //service is the e-mail service that you want to use
    auth: {
      user: process.env.email,
      //user should be the email id from which you want to send the mail
      pass: process.env.password
      //pass should be the password for the said email id
    }
  })

  const emailTemplate = passwordResetEmailTemplate(user, link)

  const mailOptions_ForStudent = {
    from: process.env.email,
    to: user.email,
    cc: '',
    bcc: '',
    subject: 'Codify College Password Reset',
    text: '',
    html: emailTemplate
  }

  transporter.sendMail(mailOptions_ForStudent, (err, info) => {
    if (err) {
      console.log('err:' + err)
      notErr = false
      return res
        .status(500)
        .json({ success: false, message: 'NodeMailer Error : ' + err })
    }
  })
  return notErr
}

module.exports = {
  sendResetPasswordMail
}
