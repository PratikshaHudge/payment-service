const nodemailer = require("nodemailer");

module.exports = async (email, paymentId, amount) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Ripple AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Ripple AI Donation Receipt",
    text: `
Thank you for your donation ❤️

Payment ID: ${paymentId}
Amount: ₹${amount}

— Ripple AI Team
`
  });
};
