import { Resend } from "resend";
import ResetPassword from "@/components/emails/reset-password";
import VerifyEmail from "@/components/emails/verify-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerifyEmail = async ({
  email,
  redirectUrl,
}: {
  email: string;
  redirectUrl: string;
}) => {
  await resend.emails.send({
    from: "Notesify <app@notesify.ai>",
    to: email,
    subject: "Notesify - Verify your email address",
    react: VerifyEmail({ redirectUrl }),
  });
};

export const sendResetPasswordEmail = async ({
  email,
  redirectUrl,
}: {
  email: string;
  redirectUrl: string;
}) => {
  await resend.emails.send({
    from: "Notesify <app@notesify.ai>",
    to: email,
    subject: "Notesify - Reset your password",
    react: ResetPassword({ redirectUrl }),
  });
};
