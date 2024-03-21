// import node mailer
const nodeMailer = require('nodemailer');
const config = require('../utils/config.js');

const  sendEmail = (to,link) => {

  // create Transport - smtp,imap etc .. 
const transporter = nodeMailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  port: 587,
  secure: false,// if port 465 then secure is true ,else 587 then secure is false 
  auth: {
    user: config.UserName,
    pass: config.Password,
  },
});

const info = transporter.sendMail({
  from: config.UserName, // sender address
  to: to, // list of receivers
  subject: "Password Reset", // Subject line
  // text: ".", // plain text body
  html: `To change password click below link and reset it  <a target = "_blank" href = "${link}" >Click Here</a>.`, // html body
});

return info;

}

module.exports = sendEmail;