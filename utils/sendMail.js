const nodemailer = require("nodemailer");

const sendMail = async (subject, message, send_to, sent_from, reply_to) => {

    const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    }
  });

  const options = {
    from: sent_from,
    to: send_to,
    replyTo: reply_to,
    subject: subject,
    html: message,
  };

  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

module.exports = sendMail;