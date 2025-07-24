import { transporter } from '@/utils/email';
import pool from '@/adapters/postgres/postgres.adapter';

interface SendOtpInput {
  email: string;
  name: string;
  otp: string;
}

interface SendNoteEmailInput {
  userId: string;
  note: string;
  title: string;
}

// Ye function signup ke time call hota hai email verification OTP bhejne ke liye.
export const sendOtpToEmail = async ({ email, name, otp }: SendOtpInput) => {
  return await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: "Verify your Email",
    text: `Hello ${name},\n\nYour OTP code is ${otp}. It expires in 5 minutes.`,
  });
};

// Ye function kisi bhi verified user ko custom message (note) bhejne ke liye use hota hai.
export const sendNoteToUser = async ({ userId, note, title }: SendNoteEmailInput) => {
  const userRes = await pool.query("SELECT name, email FROM users WHERE id = $1", [userId]);
  const user = userRes.rows[0];
  if (!user) throw new Error("User not found");

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: user.email,
    subject: title,
    text: `Hello ${user.name},\n\n${note}`,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

// Ye function admin ke through create hone wale naye users ko unki login credentials bhejne ke liye use hota hai.
interface SendUserCredentialsInput {
  name: string;
  email: string;
  password: string;
}

export const sendUserCredentials = async ({ name, email, password }: SendUserCredentialsInput) => {
  const subject = "Your Login Credentials";
  const html = `
    <h2>Hello ${name},</h2>
    <p>You've been registered. Here are your credentials:</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Password:</strong> ${password}</p>
    <p>Please log in and verify OTP to access your account.</p>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject,
    html,
  });
};