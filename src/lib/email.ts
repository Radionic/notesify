import { Resend } from "resend";
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
    from: "Notesify <no-reply@notesify.ai>",
    to: email,
    subject: "Notesify - Verify your email address",
    react: VerifyEmail({ redirectUrl }),
  });
};
