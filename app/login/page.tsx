import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/forms";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to save itineraries, places and guides on Discover Bangladesh AI.",
  robots: { index: false, follow: true },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : "/account";
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect(next);

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      description="Your saved trips and places are waiting. Accounts are optional — the guides stay free."
    >
      <LoginForm next={next} resetDone={params.reset === "1"} />
    </AuthShell>
  );
}
