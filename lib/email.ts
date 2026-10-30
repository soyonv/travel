import type { Bindings } from "@/lib/db";

export type EmailResult = { sent: boolean; reason?: string };

/**
 * Sends transactional email through Resend when RESEND_API_KEY and EMAIL_FROM
 * are configured. Without them we return sent:false and the caller shows setup
 * guidance instead of pretending an email was delivered.
 */
export async function sendEmail({
  bindings,
  to,
  subject,
  text,
}: {
  bindings: Bindings;
  to: string;
  subject: string;
  text: string;
}): Promise<EmailResult> {
  const key = bindings.RESEND_API_KEY;
  const from = bindings.EMAIL_FROM;
  if (!key || !from) return { sent: false, reason: "email_not_configured" };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, text }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      return { sent: false, reason: `provider_${response.status}` };
    }
    return { sent: true };
  } catch {
    return { sent: false, reason: "network" };
  }
}
