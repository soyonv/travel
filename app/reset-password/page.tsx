import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetForm } from "@/components/auth/forms";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell
        eyebrow="Account recovery"
        title="That link is incomplete"
        description="A reset link needs its token. Request a fresh one and use the newest email."
      >
        <Link href="/forgot-password" className="btn btn-primary w-full px-5 text-[13.5px]">
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password"
      description="Use at least 10 characters with a letter and a number. Signing in elsewhere will be required again."
    >
      <ResetForm token={token} />
    </AuthShell>
  );
}
