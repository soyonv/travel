import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
  tone = "light",
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  children?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
}) {
  return (
    <header
      className={cn(
        "border-b border-ink-900/8 pb-8 pt-8",
        tone === "dark" && "border-white/10 bg-forest-950 pb-12 pt-10 text-ivory-100",
      )}
    >
      <div className={cn("page", align === "center" && "text-center")}>
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
        {eyebrow ? (
          <p className={cn("eyebrow mb-2.5", tone === "dark" && "text-sunset-400")}>{eyebrow}</p>
        ) : null}
        <h1
          className={cn(
            "display max-w-3xl text-[clamp(2.1rem,5vw,3.6rem)]",
            tone === "dark" ? "text-ivory-50" : "text-forest-900",
            align === "center" && "mx-auto",
          )}
        >
          {title}
        </h1>
        {description ? (
          <div
            className={cn(
              "mt-3 max-w-2xl text-[15px] leading-relaxed",
              tone === "dark" ? "text-ivory-200/75" : "text-ink-500",
              align === "center" && "mx-auto",
            )}
          >
            {description}
          </div>
        ) : null}
        {children ? <div className="mt-5">{children}</div> : null}
      </div>
    </header>
  );
}
