var mailer = require('nodemailer')
const { studentEmailTemplate } = require('../util/student_email_template')
let notErr = true

const sendMail = (
  res,
  toUser,
  subject,
  html = {
    student: '',
    text: ' default text...',
    assignment: '',
    link: '#'
  }
) => {
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

  const emailTemplate = studentEmailTemplate(toUser.name, html.text, html.assignment)

  const mailOptions_ForStudent = {
    from: process.env.email,
    to: toUser.email,
    cc: '',
    bcc: '',
    subject: subject,
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
  sendMail
}
