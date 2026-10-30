import Link from "next/link";
import { Compass, MapPin, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main id="main" className="page py-16">
      <div className="mx-auto max-w-xl text-center">
        <p className="display text-[5rem] leading-none text-forest-200">404</p>
        <h1 className="display mt-2 text-[clamp(1.9rem,4vw,2.8rem)] text-forest-900">This path leads nowhere</h1>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-ink-500">
          The page may have moved, the destination record may have been renamed, or the link is simply wrong. Nothing has been
          lost — start from the map or the directory.
        </p>

        <form action="/search" className="mx-auto mt-6 flex max-w-md items-center gap-2">
          <label htmlFor="notfound-search" className="sr-only">
            Search the site
          </label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input id="notfound-search" name="q" className="field pl-9" placeholder="Try “Sundarbans” or “সিলেট”" />
          </div>
          <button type="submit" className="btn btn-primary px-4 py-2.5 text-[13px]">
            Search
          </button>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className="btn btn-ghost px-4 py-2 text-[12.5px]">
            Home
          </Link>
          <Link href="/destinations" className="btn btn-ghost px-4 py-2 text-[12.5px]">
            <Compass className="size-3.5" aria-hidden /> Destinations
          </Link>
          <Link href="/districts" className="btn btn-ghost px-4 py-2 text-[12.5px]">
            All 64 districts
          </Link>
          <Link href="/map" className="btn btn-ghost px-4 py-2 text-[12.5px]">
            <MapPin className="size-3.5" aria-hidden /> Map
          </Link>
        </div>
      </div>
    </main>
  );
}
