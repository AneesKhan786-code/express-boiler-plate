import { transporter } from '@/utils/email';
import {db} from "../../../drizzle/db"
import { users } from "../../../drizzle/schema/users";
import { eq } from 'drizzle-orm';

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

//  Send OTP during signup
export const sendOtpToEmail = async ({ email, name, otp }: SendOtpInput) => {
  return await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: "Verify your Email",
    text: `Hello ${name},\n\nYour OTP code is ${otp}. It expires in 5 minutes.`,
  });
};

//  Send note to verified user using Drizzle
export const sendNoteToUser = async ({ userId, note, title }: SendNoteEmailInput) => {
  const result = await db.select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, userId));

  const user = result[0];
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

// ✅ 3. Send login credentials to newly created user
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
