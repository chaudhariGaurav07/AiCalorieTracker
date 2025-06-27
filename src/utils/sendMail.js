
import nodemailer from "nodemailer";

export const sendMail = async ({ to, subject, html }) => {
  try {
    // Transporter setup (use Gmail, Mailtrap, or any SMTP)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,     //  email
        pass: process.env.MAIL_PASS,     //  app password not is real pass
      },
    });

    const mailOptions = {
      from: `"Calorie Tracker" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(" Email sent:", info.response);
    return info;
  } catch (error) {
    console.error(" Email send error:", error.message);
    throw error;
  }
};
