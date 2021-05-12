var mailer = require('nodemailer')
let notErr =true;

const sendMail=  (
    res,
    toUser,
    subject,
    html={
        student:'', 
        text:' default text...',
        assignment:'',
        link:'#'})=>{

//console.log('sening mail stated : ',toUser, html, subject);
const transporter = mailer.createTransport({
    service:'gmail',
    //service is the e-mail service that you want to use
    auth:{
    user:process.env.email,
    //user should be the email id from which you want to send the mail
    pass:process.env.password
    //pass should be the password for the said email id
      }
    
    })


    const mailOptions_ForStudent={
      from:process.env.email,
      to:toUser.email,
      cc:'',
      bcc:'',
      subject: subject,
      text: '',
      html:'<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="style.css"></head><style>*{box-sizing: border-box;}p{line-height:1.5;margin:auto;font-size:110%;font-family:Verdana,Geneva,Tahoma,sans-serif}a{text-decoration:underline;color:#2f2f2f}a:hover{color:#494747}button{width:20%;padding:10px;margin:0 auto;display:block;border-radius:10px;background-color:#fa5c23}button:hover{cursor:pointer;background-color:#ff4500}</style><body style="width:100%"><div style="display:block;width:60%;margin:0 atuo!important;overflow:auto;background-color:#e7e7e7";padding:15 25px;><p>Hi '+toUser.name+',<br><br>'+html.student+' '+html.text+' : '+'<strong>'+html.assignment+'</strong><br><br><br><button type="button"><a href='+html.link+' style="text-decoration:none;">CHECK IT HERE</a></button><br><br><br><br><hr><a href="mailto:info@codifycollege.se" target="_blank" style="text-decoration:none">info@codifycollege.se</a><br><br></p><p>Tel: <a href="tel:+46723338723" style="text-decoration:none">+46 723338723</a></p><p>Visit us at: <a href="www.codifycollege.se">www.codifycollege.se</a></p><p><a href="https://www.linkedin.com/company/codify-college/">LinkedIn</a> ,<a href="https://www.facebook.com/codifyCollege">Facebook</a> ,<a href="https://www.youtube.com/channel/UCXi6GEt0yD0ZXmlrnHgKfPA/featured">YouTube</a> ,<a href="https://www.instagram.com/codify.college/">Instagram</a></p><p >Cheers,<br>Codify College AB</p></div></body></html>'
          
      }
    

  // send email back to the student
  transporter.sendMail(mailOptions_ForStudent,(err , info)=>{
    if ( err) {
        console.log('err:'+err);
        notErr=false;
        return res.status(500).json({ success: false , message:'NodeMailer Error : ' + err })}
      

  })
    return notErr;
}


module.exports= {
    sendMail
}