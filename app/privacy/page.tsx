import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Discover Bangladesh AI handles personal data: accounts, saved trips, inquiries, newsletter subscriptions, cookies, AI requests and your rights.",
  alternates: { canonical: "/privacy" },
  openGraph: { title: "Privacy policy", url: absoluteUrl("/privacy") },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Trust"
      title="Privacy policy"
      description="What we collect, why, how long we keep it and how to get rid of it. Written to match what the code actually does."
      updated="24 October 2026"
      aside={
        <div className="card p-4">
          <p className="text-[12px] font-bold text-forest-900">Quick actions</p>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
            Signed-in users can export everything as JSON or delete the account and its contents from the account page.
          </p>
          <Link href="/account" className="btn btn-primary mt-3 w-full px-4 py-2 text-[11.5px]">
            Open my account
          </Link>
          <Link href="/contact" className="btn btn-ghost mt-2 w-full px-4 py-2 text-[11.5px]">
            Contact the team
          </Link>
        </div>
      }
      sections={[
        {
          id: "collect",
          heading: "What we collect",
          body: (
            <>
              <p>
                <strong>Account data</strong> — your name, email address, password hash, preferred language, role and the
                dates you joined or changed the record. We never store the password itself.
              </p>
              <p>
                <strong>Your content</strong> — saved destinations, saved articles, itineraries and their stops, and any
                sharing setting you choose.
              </p>
              <p>
                <strong>Messages</strong> — the name, email, optional phone number and text you submit through inquiry or
                partner forms. Newsletter subscriptions store the email, locale, source and consent timestamp.
              </p>
              <p>
                <strong>Technical data</strong> — the hosting platform records standard request logs (IP address, user agent,
                path, timestamp) for security and abuse prevention. We do not add advertising or cross-site tracking scripts.
              </p>
            </>
          ),
        },
        {
          id: "why",
          heading: "Why we process it",
          body: (
            <>
              <ul>
                <li>To create and secure your account and to keep you signed in.</li>
                <li>To store and display the places, reading list and itineraries you save.</li>
                <li>To answer inquiries and improve the accuracy of our content.</li>
                <li>To send the newsletter, only where you gave explicit consent.</li>
                <li>To prevent abuse, rate-limit automated requests and keep the service available.</li>
              </ul>
              <p>
                We do not sell personal data, build advertising profiles, or share your itineraries publicly unless you turn
                sharing on for that trip.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          heading: "Cookies and local storage",
          body: (
            <>
              <p>Two first-party cookies are used, both strictly functional:</p>
              <ul>
                <li>
                  <code>db_session</code> — an HTTP-only session token, valid for 30 days, used only when you sign in.
                </li>
                <li>
                  <code>db_lang</code> — your English or Bangla preference, valid for one year.
                </li>
              </ul>
              <p>
                The announcement bar also stores a dismissal flag in <code>sessionStorage</code>; it disappears when the tab
                closes. See the{" "}
                <Link href="/cookies">cookie preferences</Link> page for detail and controls.
              </p>
            </>
          ),
        },
        {
          id: "ai",
          heading: "AI requests",
          body: (
            <>
              <p>
                When you use BanglaVoyage AI, the messages you type are sent through our server to the configured AI
                provider, together with a compact extract of our destination records and active travel advisories. The
                provider processes that request to return a response.
              </p>
              <p>
                Do not paste sensitive personal data, passport numbers, payment details or other people&apos;s private
                information into the chat. We do not use your messages to train models, and we do not attach your account
                identity to the AI request.
              </p>
            </>
          ),
        },
        {
          id: "sharing",
          heading: "Who processes data for us",
          body: (
            <>
              <ul>
                <li>
                  <strong>Cloudflare</strong> — hosting, the D1 database, the R2 media bucket and request logs.
                </li>
                <li>
                  <strong>AI provider</strong> — an OpenAI-compatible endpoint, only for AI planner and chat requests.
                </li>
                <li>
                  <strong>Email provider</strong> — only if <code>RESEND_API_KEY</code> and <code>EMAIL_FROM</code> are
                  configured, and only for password-reset emails.
                </li>
                <li>
                  <strong>OpenStreetMap</strong> — map tiles are loaded from OSM servers when you open the map, which receives
                  your IP address as any website request would.
                </li>
              </ul>
              <p>No data is sold, and no third-party analytics or ad networks are loaded.</p>
            </>
          ),
        },
        {
          id: "retention",
          heading: "How long we keep it",
          body: (
            <>
              <ul>
                <li>Account, saved content and itineraries — until you delete them or the account.</li>
                <li>Inquiries — up to 24 months after the last reply, then deleted.</li>
                <li>Newsletter subscriptions — until you unsubscribe or ask us to remove the address.</li>
                <li>Password-reset tokens — one hour, then unusable; expired records are cleaned up.</li>
                <li>Server logs — retained by the hosting provider for a short operational window.</li>
              </ul>
            </>
          ),
        },
        {
          id: "rights",
          heading: "Your rights",
          body: (
            <>
              <p>
                You can export a JSON copy of your profile, saved places, reading list and itineraries from the{" "}
                <Link href="/account">account page</Link>, and delete the account there. Deletion removes the account, saved
                items, itineraries and sessions immediately.
              </p>
              <p>
                You can also ask us to correct or remove an inquiry, withdraw newsletter consent, or explain how a decision
                was made. Use the <Link href="/contact">contact form</Link> and choose the privacy subject. If you are not
                satisfied, you may complain to the relevant data-protection authority in your country.
              </p>
            </>
          ),
        },
        {
          id: "security",
          heading: "Security",
          body: (
            <>
              <p>
                Passwords are hashed with PBKDF2-SHA256 (120,000 iterations, per-user salt). Sessions use random 256-bit
                tokens stored hashed in the database and sent in HTTP-only, SameSite=Lax cookies. Administrative operations
                are role-checked on the server and recorded in an audit log.
              </p>
              <p>
                No system is perfect. If you believe an account has been compromised, change the password from the account
                page and contact us.
              </p>
            </>
          ),
        },
        {
          id: "transfers",
          heading: "International transfers",
          body: (
            <p>
              The hosting, AI and email providers may process data outside Bangladesh. Where that happens, we rely on the
              providers&apos; standard contractual safeguards. If you need details before creating an account, ask us first.
            </p>
          ),
        },
        {
          id: "children",
          heading: "Children",
          body: (
            <p>
              The service is intended for people aged 16 and over. We do not knowingly create accounts for younger children.
              If you believe a child has created one, contact us and we will remove it.
            </p>
          ),
        },
        {
          id: "changes",
          heading: "Changes and contact",
          body: (
            <>
              <p>
                If this policy changes materially, the date at the top changes and signed-in users see a notice on the account
                page. The <Link href="/contact">contact form</Link> is the reliable way to reach us; choose “Data or privacy”
                as the subject.
              </p>
              <p className="text-[12px] text-ink-400">
                This policy describes the open-source reference deployment. If you run your own copy, you are the controller
                and must adapt it.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
