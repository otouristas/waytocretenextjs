"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker, Polyline } from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/cn";

export type PlannerMapPin = {
  slug: string;
  lat: number;
  lng: number;
  kind: "start" | "stop" | "available";
  label: string;
  order?: number;
};

const CRETE_CENTER: [number, number] = [35.3, 24.88];
const CRETE_OVERVIEW_ZOOM = 8.15;
const CRETE_MAX_BOUNDS: [[number, number], [number, number]] = [
  [34.72, 23.2],
  [35.88, 26.55],
];

/** OSM Humanitarian tiles. No key. Carto's free raster now watermarks "API KEY REQUIRED". */
const OSM_TILE = "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png";
const OSM_FALLBACK = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function pinClass(pin: PlannerMapPin, selected: boolean) {
  return cn(
    "planner-pin",
    pin.kind === "start" && "planner-pin-start",
    pin.kind === "stop" && "planner-pin-stop",
    pin.kind === "available" && "planner-pin-available",
    selected && "planner-pin-selected",
  );
}

function escapeAttr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function pinHtml(pin: PlannerMapPin, selected: boolean) {
  const inner = pin.kind === "stop" && pin.order != null ? `<span>${pin.order}</span>` : "";
  return `<button type="button" class="${pinClass(pin, selected)}" aria-label="${escapeAttr(pin.label)}" title="${escapeAttr(pin.label)}">${inner}</button>`;
}

function iconSize(pin: PlannerMapPin): [number, number] {
  if (pin.kind === "available") return [12, 12];
  if (pin.kind === "start") return [22, 22];
  return [26, 32];
}

function iconAnchor(pin: PlannerMapPin): [number, number] {
  if (pin.kind === "available") return [6, 6];
  if (pin.kind === "start") return [11, 11];
  return [13, 26];
}

function waitForSize(el: HTMLElement, timeoutMs = 2500): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const read = () => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    };
    const first = read();
    if (first.width >= 8 && first.height >= 8) {
      resolve(first);
      return;
    }
    const ro = new ResizeObserver(() => {
      const next = read();
      if (next.width >= 8 && next.height >= 8) {
        ro.disconnect();
        window.clearTimeout(timer);
        resolve(next);
      }
    });
    ro.observe(el);
    const timer = window.setTimeout(() => {
      ro.disconnect();
      resolve(read());
    }, timeoutMs);
  });
}

export function CreteMap({
  pins,
  route,
  selected,
  onSelect,
  className,
}: {
  pins: readonly PlannerMapPin[];
  route: ReadonlyArray<{ lat: number; lng: number }>;
  selected?: string | null;
  onSelect?: (slug: string) => void;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const glowRef = useRef<Polyline | null>(null);
  const lineRef = useRef<Polyline | null>(null);
  const markersRef = useRef<Map<string, LeafletMarker>>(new Map());
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);
  const routeKey = route.map((p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join("|");
  const pinKey = pins.map((p) => `${p.slug}:${p.kind}:${p.order ?? ""}`).join("|");

  onSelectRef.current = onSelect;

  useEffect(() => {
    const wrap = wrapRef.current;
    const node = rootRef.current;
    if (!wrap || !node || mapRef.current) return;

    let cancelled = false;
    let ro: ResizeObserver | undefined;

    void (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !wrapRef.current || !rootRef.current) return;
      await waitForSize(wrapRef.current);
      if (cancelled || !wrapRef.current || !rootRef.current) return;

      const map = L.map(rootRef.current, {
        center: CRETE_CENTER,
        zoom: CRETE_OVERVIEW_ZOOM,
        minZoom: 7,
        maxZoom: 13,
        zoomSnap: 0.25,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false,
        dragging: true,
        maxBounds: L.latLngBounds(CRETE_MAX_BOUNDS[0], CRETE_MAX_BOUNDS[1]),
        maxBoundsViscosity: 0.8,
      });
      map.zoomControl.setPosition("bottomright");
      map.attributionControl.setPrefix(false);

      let fellBack = false;
      const tiles = L.tileLayer(OSM_TILE, {
        attribution: TILE_ATTR,
        subdomains: "abc",
        maxZoom: 19,
      }).addTo(map);
      tiles.on("tileerror", () => {
        if (fellBack) return;
        fellBack = true;
        tiles.setUrl(OSM_FALLBACK);
      });

      glowRef.current = L.polyline([], {
        color: "#392420",
        weight: 8,
        opacity: 0.2,
        lineCap: "round",
        lineJoin: "round",
        interactive: false,
      }).addTo(map);
      lineRef.current = L.polyline([], {
        color: "#506551",
        weight: 3.5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
        interactive: false,
      }).addTo(map);

      mapRef.current = map;
      const resize = () => map.invalidateSize({ animate: false });
      requestAnimationFrame(resize);
      window.setTimeout(resize, 80);
      ro = new ResizeObserver(resize);
      ro.observe(wrapRef.current);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      setReady(false);
      ro?.disconnect();
      for (const marker of markersRef.current.values()) marker.remove();
      markersRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
      glowRef.current = null;
      lineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    const glow = glowRef.current;
    const line = lineRef.current;
    if (!map || !glow || !line) return;

    const latlngs: [number, number][] = route.map((p) => [p.lat, p.lng]);
    glow.setLatLngs(latlngs);
    line.setLatLngs(latlngs);

    if (latlngs.length >= 2) {
      map.fitBounds(latlngs, { padding: [28, 28], maxZoom: 11, animate: true });
    } else {
      map.setView(CRETE_CENTER, CRETE_OVERVIEW_ZOOM, { animate: true });
    }
    window.setTimeout(() => map.invalidateSize({ animate: false }), 60);
  }, [ready, routeKey, route]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;

    void import("leaflet").then((mod) => {
      const L = mod.default;
      const current = mapRef.current;
      if (!current) return;

      const keep = new Set(pins.map((p) => p.slug));
      for (const [slug, marker] of markersRef.current) {
        if (!keep.has(slug)) {
          marker.remove();
          markersRef.current.delete(slug);
        }
      }

      for (const pin of pins) {
        const selectedPin = selected === pin.slug;
        const icon = L.divIcon({
          className: "planner-pin-wrap",
          html: pinHtml(pin, selectedPin),
          iconSize: iconSize(pin),
          iconAnchor: iconAnchor(pin),
        });
        const existing = markersRef.current.get(pin.slug);
        if (existing) {
          existing.setLatLng([pin.lat, pin.lng]);
          existing.setIcon(icon);
          existing.setZIndexOffset(selectedPin || pin.kind === "stop" ? 400 : 0);
          continue;
        }
        const marker = L.marker([pin.lat, pin.lng], {
          icon,
          keyboard: true,
          title: pin.label,
          zIndexOffset: pin.kind === "stop" ? 300 : 0,
        }).addTo(current);
        marker.on("click", () => onSelectRef.current?.(pin.slug));
        markersRef.current.set(pin.slug, marker);
      }
    });
  }, [ready, pinKey, pins, selected]);

  return (
    <div ref={wrapRef} className={cn("planner-map absolute inset-0", className)}>
      <div ref={rootRef} className="size-full" />
    </div>
  );
}
