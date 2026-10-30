import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/forms";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a free account to save Bangladesh itineraries, places and guides.",
  robots: { index: false, follow: true },
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect("/account");

  return (
    <AuthShell
      eyebrow="Free and optional"
      title="Create an account"
      description="Save itineraries, keep a list of places and download your data. No card, no marketing list."
    >
      <RegisterForm next={params.next} />
    </AuthShell>
  );
}
