"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "Print", className = "btn btn-ghost px-4 py-2 text-[12.5px]" }: { label?: string; className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      <Printer className="size-3.5" aria-hidden /> {label}
    </button>
  );
}
