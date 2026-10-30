"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Copy, ExternalLink, Loader2, Share2, Trash2 } from "lucide-react";
import { deleteTripAction, duplicateTripAction, setTripSharingAction } from "@/app/actions/trips";
import { cn } from "@/lib/utils";

export function TripActions({
  tripId,
  isPublic,
  shareToken,
}: {
  tripId: string;
  isPublic: boolean;
  shareToken: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [token, setToken] = useState(shareToken);
  const [shared, setShared] = useState(isPublic);

  return (
    <div className="mt-3 border-t border-ink-900/8 pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/trip-planner?trip=${tripId}`} className="btn btn-ghost px-3 py-1.5 text-[11.5px]">
          <ExternalLink className="size-3" aria-hidden /> Edit
        </Link>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await duplicateTripAction(tripId);
              setMessage(result.message);
              router.refresh();
            })
          }
          className="btn btn-ghost px-3 py-1.5 text-[11.5px] disabled:opacity-50"
        >
          {pending ? <Loader2 className="size-3 animate-spin" aria-hidden /> : <Copy className="size-3" aria-hidden />} Duplicate
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await setTripSharingAction(tripId, !shared);
              setMessage(result.message);
              if (result.ok) {
                setShared(!shared);
                if (result.shareToken) setToken(result.shareToken);
              }
              router.refresh();
            })
          }
          className={cn("btn px-3 py-1.5 text-[11.5px] disabled:opacity-50", shared ? "btn-primary" : "btn-ghost")}
        >
          <Share2 className="size-3" aria-hidden /> {shared ? "Sharing on" : "Share"}
        </button>
        {confirming ? (
          <span className="inline-flex items-center gap-1.5">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await deleteTripAction(tripId);
                  setMessage(result.message);
                  setConfirming(false);
                  router.refresh();
                })
              }
              className="rounded-full bg-red-700 px-3 py-1.5 text-[11px] font-semibold text-white"
            >
              Confirm delete
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="text-[11px] text-ink-500 underline">
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11.5px] font-semibold text-red-700 hover:bg-red-50"
          >
            <Trash2 className="size-3" aria-hidden /> Delete
          </button>
        )}
      </div>

      {shared && token ? (
        <p className="mt-2 break-all rounded-lg bg-ivory-100 px-2.5 py-1.5 font-mono text-[10px] text-ink-600">
          /trips/{token}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="mt-1.5 text-[11px] text-ink-500">
          {message}
        </p>
      ) : null}
    </div>
  );
}
