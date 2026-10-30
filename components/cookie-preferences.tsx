"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Cookie, Save } from "lucide-react";

type Prefs = { functional: true; analytics: boolean; marketing: boolean };

const KEY = "db-cookie-preferences";
const DEFAULTS: Prefs = { functional: true, analytics: false, marketing: false };

export function CookiePreferences() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Prefs>;
        setPrefs({
          functional: true,
          analytics: Boolean(parsed.analytics),
          marketing: Boolean(parsed.marketing),
        });
      }
    } catch {
      // Corrupt preference is treated as the default.
    }
    setHydrated(true);
  }, []);

  const save = () => {
    localStorage.setItem(KEY, JSON.stringify(prefs));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-forest-100 bg-forest-50 px-3.5 py-3 text-[11.5px] leading-relaxed text-forest-700">
        <p className="flex items-center gap-1.5 font-bold">
          <Cookie className="size-3.5" aria-hidden /> Current build: no tracking is loaded
        </p>
        <p className="mt-1">
          This deployment loads no analytics, advertising or social pixels. The optional categories below are recorded so your
          choice is honoured if such a tool is added later. You can change this at any time.
        </p>
      </div>

      <ul className="space-y-2">
        <li className="flex items-start justify-between gap-4 rounded-xl border border-ink-900/8 bg-white px-4 py-3">
          <div>
            <p className="text-[12.5px] font-semibold text-forest-900">Strictly necessary</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-ink-500">
              Session cookie and language preference. The site cannot work without them, so they cannot be switched off.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-forest-100 px-2.5 py-1 text-[10px] font-bold uppercase text-forest-800">
            Always on
          </span>
        </li>
        <li className="flex items-start justify-between gap-4 rounded-xl border border-ink-900/8 bg-white px-4 py-3">
          <div>
            <label htmlFor="pref-analytics" className="text-[12.5px] font-semibold text-forest-900">
              Anonymous analytics
            </label>
            <p className="mt-0.5 text-[11px] leading-relaxed text-ink-500">
              Would record page views without cross-site identifiers. Not currently loaded.
            </p>
          </div>
          <input
            id="pref-analytics"
            type="checkbox"
            checked={prefs.analytics}
            disabled={!hydrated}
            onChange={(event) => setPrefs({ ...prefs, analytics: event.target.checked })}
            className="mt-1 size-4 shrink-0 accent-forest-600"
          />
        </li>
        <li className="flex items-start justify-between gap-4 rounded-xl border border-ink-900/8 bg-white px-4 py-3">
          <div>
            <label htmlFor="pref-marketing" className="text-[12.5px] font-semibold text-forest-900">
              Marketing
            </label>
            <p className="mt-0.5 text-[11px] leading-relaxed text-ink-500">
              Would allow remarketing tags. Off by default and not used in this build.
            </p>
          </div>
          <input
            id="pref-marketing"
            type="checkbox"
            checked={prefs.marketing}
            disabled={!hydrated}
            onChange={(event) => setPrefs({ ...prefs, marketing: event.target.checked })}
            className="mt-1 size-4 shrink-0 accent-forest-600"
          />
        </li>
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} className="btn btn-primary px-4 py-2 text-[12.5px]">
          <Save className="size-3.5" aria-hidden /> Save preferences
        </button>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem(KEY);
            setPrefs(DEFAULTS);
            setSaved(true);
            window.setTimeout(() => setSaved(false), 4000);
          }}
          className="btn btn-ghost px-4 py-2 text-[12.5px]"
        >
          Reset to default
        </button>
        {saved ? (
          <span role="status" className="inline-flex items-center gap-1 text-[11.5px] text-forest-700">
            <CheckCircle2 className="size-3.5" aria-hidden /> Saved on this device
          </span>
        ) : null}
      </div>
    </div>
  );
}
