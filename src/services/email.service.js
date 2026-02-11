import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Banking App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};
 
export const sendRegistrationEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: "Welcome to Our Banking Service!",
    text: `Hello ${user.name},\n\nThank you for registering!`,
    html: `<h1>Hello ${user.name},</h1><p>Thank you for registering!</p>`,
  });
};
