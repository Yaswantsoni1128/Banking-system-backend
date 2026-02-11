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


export const sendTransactionEmail = async (email, name, toAccount, transaction) => {
  await sendEmail({
    to: email,
    subject: "Transaction Alert",
    text: `Hello ${name},\n\nA transaction of amount ${transaction.amount} has been made to account ${toAccount}.`,
    html: `<h1>Hello ${name},</h1><p>A transaction of amount ${transaction.amount} has been made to account ${toAccount}.</p><br/><p>Transaction ID: ${transaction._id}</p><br/><p>Date: ${transaction.createdAt}</p><br/><p>Status: ${transaction.status}</p><br/><p>Thank you for using our service!</p>`,
  });
};

export const sendFailedTransactionEmail = async (email, name, toAccount, transaction) => {
  await sendEmail({
    to: email,
    subject: "Transaction Failed",
    text: `Hello ${name},\n\nA transaction of amount ${transaction.amount} to account ${toAccount} has failed.`,
    html: `<h1>Hello ${name},</h1><p>A transaction of amount ${transaction.amount} to account ${toAccount} has failed.</p><br/><p>Transaction ID: ${transaction._id}</p><br/><p>Date: ${transaction.createdAt}</p><br/><p>Status: ${transaction.status}</p><br/><p>Please try again later or contact support.</p>`,
  });
};
