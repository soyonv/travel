import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetRequestForm } from "@/components/auth/forms";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Request a password reset link for your Discover Bangladesh AI account.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="We will email a link that expires in one hour. If email delivery is not configured on this deployment, the page will say so instead of pretending."
    >
      <ResetRequestForm />
    </AuthShell>
  );
}
