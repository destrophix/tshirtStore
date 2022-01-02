const nodemailer = require("nodemailer");

const mailHelper = async (option) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    auth: {
      user: SMTP_USER, // generated ethereal user
      pass: SMTP_PASS, // generated ethereal password
    },
  });

  let msg = {
    from: "tshirtstore@gmail.com", // sender address
    to: option.email, // list of receivers
    subject: option.subject, // Subject line
    text: option.msg, // plain text body
  };

  // send mail with defined transport object
  await transporter.sendMail(msg);
};

module.exports = mailHelper;
