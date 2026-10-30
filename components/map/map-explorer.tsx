"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { List, MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type MapPoint = {
  slug: string;
  name: string;
  nameBn?: string | null;
  kind: "destination" | "district" | "attraction";
  category: string;
  lat: number;
  lon: number;
  summary?: string | null;
  href: string;
};

type FilterKind = "all" | MapPoint["kind"];

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);

const KIND_LABEL: Record<FilterKind, string> = {
  all: "Everything",
  destination: "Destinations",
  district: "Districts",
  attraction: "Attractions",
};

export function MapExplorer({ points, focusSlug }: { points: MapPoint[]; focusSlug?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const layerRef = useRef<Leaflet.LayerGroup | null>(null);
  const markersRef = useRef<Map<string, Leaflet.Marker>>(new Map());
  const [ready, setReady] = useState(false);
  const [kind, setKind] = useState<FilterKind>("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [activeSlug, setActiveSlug] = useState(focusSlug ?? "");

  const categories = useMemo(
    () => Array.from(new Set(points.map((point) => point.category))).sort(),
    [points],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return points.filter((point) => {
      if (kind !== "all" && point.kind !== kind) return false;
      if (category !== "all" && point.category !== category) return false;
      if (!term) return true;
      return `${point.name} ${point.nameBn ?? ""} ${point.category}`.toLowerCase().includes(term);
    });
  }, [points, kind, category, query]);

  useEffect(() => {
    let cancelled = false;
    let map: Leaflet.Map | null = null;

    (async () => {
      const imported = await import("leaflet");
      const L = (imported.default ?? imported) as typeof Leaflet;
      if (cancelled || !containerRef.current) return;
      leafletRef.current = L;

      map = L.map(containerRef.current, {
        center: [23.685, 90.3563],
        zoom: 7,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      layerRef.current = L.layerGroup().addTo(map);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      layerRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!ready || !L || !map || !layer) return;

    layer.clearLayers();
    markersRef.current.clear();

    for (const point of filtered) {
      const isDestination = point.kind === "destination";
      const isDistrict = point.kind === "district";
      const color = isDestination ? "#0b2a21" : isDistrict ? "#14506b" : "#c96a2c";
      const icon = L.divIcon({
        className: "db-map-marker",
        html: `<span style="display:block;width:${isDestination ? 18 : 13}px;height:${isDestination ? 18 : 13}px;border-radius:999px;background:${color};border:2px solid #fdfbf6;box-shadow:0 1px 4px rgba(7,28,22,.4)"></span>`,
        iconSize: [isDestination ? 18 : 13, isDestination ? 18 : 13],
        iconAnchor: [isDestination ? 9 : 6.5, isDestination ? 9 : 6.5],
        popupAnchor: [0, -8],
      });

      const marker = L.marker([point.lat, point.lon], {
        icon,
        title: point.name,
        alt: `${point.name} on the map`,
        keyboard: true,
      }).addTo(layer);

      const popup = document.createElement("div");
      popup.className = "db-map-popup";
      popup.innerHTML = `
        <p style="margin:0 0 2px;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#c96a2c">${escapeHtml(point.kind)}</p>
        <p style="margin:0;font-size:13px;font-weight:700;color:#0b2a21">${escapeHtml(point.name)}</p>
        ${point.nameBn ? `<p style="margin:0;font-size:11px;color:#6b7d74" lang="bn">${escapeHtml(point.nameBn)}</p>` : ""}
        ${point.summary ? `<p style="margin:4px 0 0;font-size:11px;line-height:1.5;color:#4b5f56">${escapeHtml(point.summary.slice(0, 140))}</p>` : ""}
        <p style="margin:6px 0 0"><a href="${escapeHtml(point.href)}" style="font-size:11px;font-weight:700;color:#14506b">Open the full page →</a></p>
      `;
      marker.bindPopup(popup, { maxWidth: 240 });
      marker.on("click", () => setActiveSlug(point.slug));
      markersRef.current.set(point.slug, marker);
    }

    if (filtered.length) {
      const bounds = L.latLngBounds(filtered.map((point) => [point.lat, point.lon] as [number, number]));
      map.fitBounds(bounds.pad(0.15), { animate: true, maxZoom: 10 });
    }
  }, [ready, filtered]);

  const focusPoint = (point: MapPoint) => {
    setActiveSlug(point.slug);
    const map = mapRef.current;
    const marker = markersRef.current.get(point.slug);
    if (map && marker) {
      map.flyTo([point.lat, point.lon], Math.max(map.getZoom(), 11), { duration: 0.8 });
      marker.openPopup();
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
      <div className="card flex max-h-[640px] flex-col overflow-hidden">
        <div className="border-b border-ink-900/8 p-3">
          <div className="relative">
            <label htmlFor="map-search" className="sr-only">
              Search map places
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              id="map-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a place"
              className="field py-2 pl-8 pr-8 text-[12.5px]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-400 hover:bg-ivory-100"
                aria-label="Clear search"
              >
                <X className="size-3" aria-hidden />
              </button>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {(Object.keys(KIND_LABEL) as FilterKind[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setKind(value)}
                aria-pressed={kind === value}
                data-active={kind === value}
                className="chip text-[10.5px]"
              >
                {KIND_LABEL[value]}
              </button>
            ))}
          </div>

          <label htmlFor="map-category" className="sr-only">
            Filter by category
          </label>
          <select
            id="map-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="field mt-2 py-1.5 text-[12px]"
          >
            <option value="all">All categories</option>
            {categories.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>

          <p className="mt-2 text-[10.5px] text-ink-400" aria-live="polite">
            {filtered.length} mapped place{filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        <ul className="min-h-0 flex-1 divide-y divide-ink-900/5 overflow-y-auto">
          {filtered.map((point) => (
            <li key={`${point.kind}-${point.slug}`}>
              <div
                className={cn(
                  "flex items-start gap-2 px-3 py-2.5",
                  activeSlug === point.slug && "bg-forest-50/70",
                )}
              >
                <button
                  type="button"
                  onClick={() => focusPoint(point)}
                  className="min-w-0 flex-1 text-left"
                  aria-label={`Show ${point.name} on the map`}
                >
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3 shrink-0 text-forest-500" aria-hidden />
                    <span className="truncate text-[12.5px] font-semibold text-forest-900">{point.name}</span>
                  </span>
                  <span className="mt-0.5 block truncate pl-4.5 text-[10.5px] text-ink-400">
                    {point.kind} · {point.category}
                  </span>
                </button>
                <Link
                  href={point.href}
                  className="mt-0.5 shrink-0 rounded-full border border-ink-900/10 px-2 py-0.5 text-[10px] font-semibold text-river-700 hover:border-river-500"
                >
                  Open
                </Link>
              </div>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-[12px] text-ink-500">
              Nothing on the map matches those filters.
            </li>
          ) : null}
        </ul>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-900/10 bg-white">
        <div ref={containerRef} className="h-[420px] w-full sm:h-[560px] lg:h-[640px]" role="application" aria-label="Interactive map of Bangladesh" />
        <p className="flex items-center gap-1.5 border-t border-ink-900/8 px-3 py-2 text-[10.5px] text-ink-400">
          <List className="size-3" aria-hidden />
          Map data © OpenStreetMap contributors. Scroll zoom is off until you click the map. Coordinates are approximate.
        </p>
      </div>
    </div>
  );
}
