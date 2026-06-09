
import nodemailer from "nodemailer";
import dns from "node:dns";

// Render Free Tier has broken outbound IPv6 routing. 
// Force Node to resolve IPv4 addresses for smtp.gmail.com.
dns.setDefaultResultOrder("ipv4first");

export const sendMail = async ({ to, subject, html }) => {
  try {
    // Transporter setup (use Gmail, Mailtrap, or any SMTP)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
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
