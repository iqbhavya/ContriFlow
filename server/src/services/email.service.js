const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"ContriFlow" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify your ContriFlow email",
    text: `Your ContriFlow verification code is ${otp}. It expires in 10 minutes.`,
    html: `
      <h2>Verify your email</h2>
      <p>Use this code to complete your ContriFlow signup:</p>
      <h1 style="letter-spacing: 6px">${otp}</h1>
      <p>This code expires in 10 minutes. Do not share it with anyone.</p>
    `,
  });
};

module.exports = { sendOtpEmail };

