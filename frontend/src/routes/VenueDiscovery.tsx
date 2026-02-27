import type { FeatureCollection, Point } from "geojson";
import { LocateFixed, Search } from "lucide-react";
import type mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Source, Layer, Marker, Popup } from "react-map-gl/mapbox";
import type { MapMouseEvent, MapRef } from "react-map-gl/mapbox";
import {
  useVenues,
  useSessions,
  type BaserowVenue,
  type BaserowSession,
} from "../hooks/useBaserow";
import { useAuth } from "../lib/auth";
import { createRow, TABLES } from "../lib/baserow";
import { sendVenueInfo, requestSession, type VenueInfo } from "../lib/telegram";
import "mapbox-gl/dist/mapbox-gl.css";

// Hide Mapbox logo + attribution
const mapboxHideStyle = document.createElement("style");
mapboxHideStyle.textContent = `.mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib { display: none !important; }`;
document.head.appendChild(mapboxHideStyle);

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

type LayerKey = "venues" | "checkins" | "neighborhoods";

const LAYER_LABELS: Record<LayerKey, string> = {
  venues: "Venues",
  checkins: "Check-ins",
  neighborhoods: "Neighborhoods",
};

// --- Helpers ---

// Baserow may return lat/lon as strings or null — always parse to number
function parseLat(v: BaserowVenue): number {
  return typeof v.lat === "string" ? parseFloat(v.lat) : (v.lat ?? NaN);
}
function parseLon(v: BaserowVenue): number {
  return typeof v.lon === "string" ? parseFloat(v.lon) : (v.lon ?? NaN);
}
function hasCoords(v: BaserowVenue): boolean {
  return !isNaN(parseLat(v)) && !isNaN(parseLon(v));
}

// --- GeoJSON builders ---

function venuesToGeoJSON(venues: BaserowVenue[]): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: venues.filter(hasCoords).map((v) => ({
      type: "Feature" as const,
      properties: {
        id: v.id,
        name: v.name,
        address: v.address,
        neighborhood: v.neighborhood,
        hours: v.hours ?? "",
        community_mode: v.community_mode,
        owner_telegram_id: v.owner_telegram_id,
        notes: v.Notes ?? "",
      },
      geometry: { type: "Point" as const, coordinates: [parseLon(v), parseLat(v)] },
    })),
  };
}

function checkinsToGeoJSON(
  sessions: BaserowSession[],
  venueMap: globalThis.Map<number, { lat: number; lon: number }>,
): FeatureCollection<Point> {
  const features = sessions
    .filter((s) => s.Active && s.venue_id?.length)
    .map((s) => {
      const vid = s.venue_id[0].id;
      const coords = venueMap.get(vid);
      if (!coords) {
        return null;
      }
      return {
        type: "Feature" as const,
        properties: { session_id: s.id },
        geometry: {
          type: "Point" as const,
          coordinates: [coords.lon, coords.lat],
        },
      };
    })
    .filter(Boolean) as FeatureCollection<Point>["features"];

  return { type: "FeatureCollection", features };
}

function neighborhoodsToGeoJSON(venues: BaserowVenue[]): FeatureCollection<Point> {
  const counts = new globalThis.Map<string, number>();
  for (const v of venues) {
    if (!v.neighborhood) {
      continue;
    }
    counts.set(v.neighborhood, (counts.get(v.neighborhood) ?? 0) + 1);
  }

  return {
    type: "FeatureCollection",
    features: venues
      .filter((v) => hasCoords(v) && v.neighborhood)
      .map((v) => ({
        type: "Feature" as const,
        properties: {
          neighborhood: v.neighborhood,
          venue_count: counts.get(v.neighborhood) ?? 1,
        },
        geometry: { type: "Point" as const, coordinates: [parseLon(v), parseLat(v)] },
      })),
  };
}

// --- Heatmap paint configs ---

const VENUE_PAINT: mapboxgl.HeatmapPaint = {
  "heatmap-weight": 1,
  "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 8, 0.5, 15, 2],
  "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 8, 20, 15, 50],
  "heatmap-color": [
    "interpolate",
    ["linear"],
    ["heatmap-density"],
    0,
    "rgba(49,130,189,0)",
    0.2,
    "#eff3ff",
    0.4,
    "#bdd7e7",
    0.6,
    "#6baed6",
    0.8,
    "#3182bd",
    1,
    "#08519c",
  ],
  "heatmap-opacity": 0.8,
};

const CHECKIN_PAINT: mapboxgl.HeatmapPaint = {
  "heatmap-weight": 1,
  "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 8, 0.5, 15, 2],
  "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 8, 25, 15, 45],
  "heatmap-color": [
    "interpolate",
    ["linear"],
    ["heatmap-density"],
    0,
    "rgba(253,141,60,0)",
    0.2,
    "#fee0b6",
    0.4,
    "#fd8d3c",
    0.6,
    "#e6550d",
    0.8,
    "#a63603",
    1,
    "#67000d",
  ],
  "heatmap-opacity": 0.8,
};

const NEIGHBORHOOD_PAINT: mapboxgl.HeatmapPaint = {
  "heatmap-weight": ["get", "venue_count"],
  "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 8, 0.3, 15, 1.5],
  "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 8, 40, 15, 100],
  "heatmap-color": [
    "interpolate",
    ["linear"],
    ["heatmap-density"],
    0,
    "rgba(116,196,118,0)",
    0.2,
    "#c7e9c0",
    0.4,
    "#74c476",
    0.6,
    "#31a354",
    0.8,
    "#006d2c",
    1,
    "#00441b",
  ],
  "heatmap-opacity": 0.8,
};

// --- Timezone → regional center mapping ---
// Browser gives us Intl timezone (e.g. "America/Chicago"), we map to a high-level region center.

const TZ_CENTERS: Record<string, { lat: number; lon: number; zoom: number }> = {
  // US timezones
  "America/New_York": { lat: 40.71, lon: -74.01, zoom: 6 }, // Eastern — NYC / East Coast
  "America/Detroit": { lat: 42.33, lon: -83.05, zoom: 6 },
  "America/Indiana/Indianapolis": { lat: 39.77, lon: -86.16, zoom: 6 },
  "America/Chicago": { lat: 41.88, lon: -89.5, zoom: 5 }, // Central — Chicago / Midwest
  "America/Menominee": { lat: 44.5, lon: -89.5, zoom: 6 }, // Wisconsin
  "America/North_Dakota/Center": { lat: 47.5, lon: -100.4, zoom: 6 },
  "America/Denver": { lat: 39.74, lon: -104.99, zoom: 5 }, // Mountain
  "America/Boise": { lat: 43.62, lon: -116.21, zoom: 6 },
  "America/Phoenix": { lat: 33.45, lon: -112.07, zoom: 6 }, // Arizona (no DST)
  "America/Los_Angeles": { lat: 34.05, lon: -118.24, zoom: 5 }, // Pacific
  "America/Anchorage": { lat: 61.22, lon: -149.9, zoom: 5 }, // Alaska
  "Pacific/Honolulu": { lat: 21.31, lon: -157.86, zoom: 7 }, // Hawaii
  // Canada
  "America/Toronto": { lat: 43.65, lon: -79.38, zoom: 6 },
  "America/Vancouver": { lat: 49.28, lon: -123.12, zoom: 6 },
  "America/Edmonton": { lat: 53.55, lon: -113.49, zoom: 6 },
  "America/Winnipeg": { lat: 49.9, lon: -97.14, zoom: 6 },
  "America/Halifax": { lat: 44.65, lon: -63.57, zoom: 6 },
  // Europe
  "Europe/London": { lat: 51.51, lon: -0.13, zoom: 5 },
  "Europe/Paris": { lat: 48.86, lon: 2.35, zoom: 5 },
  "Europe/Berlin": { lat: 52.52, lon: 13.4, zoom: 5 },
  "Europe/Madrid": { lat: 40.42, lon: -3.7, zoom: 5 },
  "Europe/Rome": { lat: 41.9, lon: 12.5, zoom: 5 },
  "Europe/Amsterdam": { lat: 52.37, lon: 4.9, zoom: 5 },
  "Europe/Moscow": { lat: 55.76, lon: 37.62, zoom: 5 },
  "Europe/Istanbul": { lat: 41.01, lon: 28.98, zoom: 5 },
  // Asia
  "Asia/Tokyo": { lat: 35.68, lon: 139.69, zoom: 5 },
  "Asia/Shanghai": { lat: 31.23, lon: 121.47, zoom: 5 },
  "Asia/Kolkata": { lat: 28.61, lon: 77.21, zoom: 5 },
  "Asia/Dubai": { lat: 25.2, lon: 55.27, zoom: 5 },
  "Asia/Singapore": { lat: 1.35, lon: 103.82, zoom: 6 },
  "Asia/Seoul": { lat: 37.57, lon: 126.98, zoom: 6 },
  "Asia/Bangkok": { lat: 13.76, lon: 100.5, zoom: 5 },
  // Oceania
  "Australia/Sydney": { lat: -33.87, lon: 151.21, zoom: 5 },
  "Australia/Melbourne": { lat: -37.81, lon: 144.96, zoom: 5 },
  "Australia/Perth": { lat: -31.95, lon: 115.86, zoom: 5 },
  "Pacific/Auckland": { lat: -36.85, lon: 174.76, zoom: 6 },
  // South America
  "America/Sao_Paulo": { lat: -23.55, lon: -46.63, zoom: 5 },
  "America/Argentina/Buenos_Aires": { lat: -34.6, lon: -58.38, zoom: 5 },
  "America/Bogota": { lat: 4.71, lon: -74.07, zoom: 5 },
  "America/Mexico_City": { lat: 19.43, lon: -99.13, zoom: 5 },
  // Africa
  "Africa/Johannesburg": { lat: -26.2, lon: 28.04, zoom: 5 },
  "Africa/Cairo": { lat: 30.04, lon: 31.24, zoom: 5 },
  "Africa/Lagos": { lat: 6.52, lon: 3.38, zoom: 5 },
};

// Fallback: match by UTC offset prefix if exact tz not in map
const OFFSET_FALLBACKS: Record<string, { lat: number; lon: number; zoom: number }> = {
  "America/": { lat: 39.83, lon: -98.58, zoom: 4 }, // Geographic center of US
  "Europe/": { lat: 50.11, lon: 8.68, zoom: 4 },
  "Asia/": { lat: 34.05, lon: 100.62, zoom: 3 },
  "Africa/": { lat: 1.65, lon: 17.76, zoom: 3 },
  "Australia/": { lat: -25.27, lon: 133.78, zoom: 4 },
  "Pacific/": { lat: -8.52, lon: -179.08, zoom: 3 },
};

function getCenterFromTimezone(): { lat: number; lon: number; zoom: number } {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TZ_CENTERS[tz]) {
      return TZ_CENTERS[tz];
    }
    // Try prefix fallback
    for (const prefix of Object.keys(OFFSET_FALLBACKS)) {
      if (tz.startsWith(prefix)) {
        return OFFSET_FALLBACKS[prefix];
      }
    }
  } catch {
    /* Intl not available */
  }
  // Ultimate fallback: center of US
  return { lat: 39.83, lon: -98.58, zoom: 4 };
}

const userCenter = getCenterFromTimezone();

interface SelectedVenue extends VenueInfo {
  id: number;
  lon: number;
  lat: number;
}

export default function VenueDiscovery() {
  const { user } = useAuth();
  const mapRef = useRef<MapRef>(null);
  const [activeLayer, setActiveLayer] = useState<LayerKey>("venues");
  const [selectedVenue, setSelectedVenue] = useState<SelectedVenue | null>(null);
  const [infoSent, setInfoSent] = useState(false);
  const [sessionSent, setSessionSent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [requestMode, setRequestMode] = useState(false);
  const [requestTime, setRequestTime] = useState("");
  const [requestNotes, setRequestNotes] = useState("");
  const [requestSending, setRequestSending] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Request browser geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }
    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationStatus("granted");
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 13,
          duration: 1500,
        });
      },
      () => {
        setLocationStatus("denied");
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }, []);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }
    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationStatus("granted");
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 13,
          duration: 1500,
        });
      },
      () => {
        setLocationStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const { data: venues } = useVenues();
  const { data: sessions } = useSessions();

  // Build venue coordinate lookup map
  const venueMap = useMemo(() => {
    const m = new globalThis.Map<number, { lat: number; lon: number }>();
    for (const v of venues) {
      if (hasCoords(v)) {
        m.set(v.id, { lat: parseLat(v), lon: parseLon(v) });
      }
    }
    return m;
  }, [venues]);

  // Build GeoJSON for each layer
  const venueGeo = useMemo(() => venuesToGeoJSON(venues), [venues]);
  const checkinGeo = useMemo(() => checkinsToGeoJSON(sessions, venueMap), [sessions, venueMap]);
  const neighborhoodGeo = useMemo(() => neighborhoodsToGeoJSON(venues), [venues]);

  // Search filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    const q = searchQuery.toLowerCase();
    return venues
      .filter(
        (v) =>
          hasCoords(v) &&
          (v.name?.toLowerCase().includes(q) || v.neighborhood?.toLowerCase().includes(q)),
      )
      .slice(0, 5);
  }, [venues, searchQuery]);

  const handleSearchSelect = useCallback((v: BaserowVenue) => {
    const lat = parseLat(v);
    const lon = parseLon(v);
    mapRef.current?.flyTo({ center: [lon, lat], zoom: 14 });
    setSelectedVenue({
      id: v.id,
      name: v.name,
      address: v.address,
      neighborhood: v.neighborhood,
      hours: v.hours ?? "",
      community_mode: v.community_mode,
      owner_telegram_id: v.owner_telegram_id,
      notes: v.Notes ?? "",
      lon,
      lat,
    });
    setSearchQuery("");
    setSearchFocused(false);
    setInfoSent(false);
    setSessionSent(false);
    setRequestMode(false);
  }, []);

  const handleMapClick = useCallback((e: MapMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) {
      return;
    }

    const features = map.queryRenderedFeatures(e.point, {
      layers: ["venues-points"],
    });

    if (!features.length) {
      setSelectedVenue(null);
      return;
    }

    const f = features[0];
    const [lon, lat] = (f.geometry as Point).coordinates;
    const p = f.properties!;

    setSelectedVenue({
      id: typeof p.id === "string" ? parseInt(p.id, 10) : p.id,
      name: p.name,
      address: p.address,
      neighborhood: p.neighborhood,
      hours: p.hours,
      community_mode: p.community_mode === true || p.community_mode === "true",
      owner_telegram_id: p.owner_telegram_id,
      notes: p.notes,
      lon,
      lat,
    });
    setInfoSent(false);
    setSessionSent(false);
    setRequestMode(false);
  }, []);

  const handleRequestInfo = useCallback(() => {
    if (!user?.telegramId || !selectedVenue) {
      return;
    }
    setInfoSent(true);
    void sendVenueInfo(user.telegramId, selectedVenue);
    setTimeout(() => setInfoSent(false), 2000);
  }, [user, selectedVenue]);

  const handleEnterRequestMode = useCallback(() => {
    setRequestMode(true);
    setRequestTime("");
    setRequestNotes("");
  }, []);

  const handleSendRequest = useCallback(async () => {
    if (!user?.telegramId || !selectedVenue) {
      return;
    }
    setRequestSending(true);
    try {
      await createRow(TABLES.sessions, {
        user_telegram_id: user.telegramId,
        venue_id: [selectedVenue.id],
        requested_time: requestTime,
        status: "pending",
        notes: requestNotes,
        created_at: new Date().toISOString(),
      });
      await requestSession(user.telegramId, user.firstName, selectedVenue, requestTime);
      setSessionSent(true);
      setTimeout(() => {
        setSelectedVenue(null);
        setSessionSent(false);
        setRequestMode(false);
      }, 2000);
    } catch (err) {
      console.error("[3rdSeat] Session request failed:", err);
    } finally {
      setRequestSending(false);
    }
  }, [user, selectedVenue, requestTime, requestNotes]);

  return (
    <div className="relative w-full h-[calc(100vh-57px)]">
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: userCenter.lat,
          longitude: userCenter.lon,
          zoom: userCenter.zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
        interactiveLayerIds={["venues-points"]}
        onClick={handleMapClick}
        cursor="pointer"
      >
        {/* Venues heatmap layer */}
        <Source id="venues-source" type="geojson" data={venueGeo}>
          <Layer
            id="venues-heat"
            type="heatmap"
            paint={VENUE_PAINT}
            layout={{ visibility: activeLayer === "venues" ? "visible" : "none" }}
          />
          {/* Clickable circle dots on top of heatmap */}
          <Layer
            id="venues-points"
            type="circle"
            paint={{
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 8, 3, 15, 8],
              "circle-color": "#22d3ee",
              "circle-opacity": 0.7,
              "circle-stroke-width": 1,
              "circle-stroke-color": "#ffffff",
            }}
          />
        </Source>

        {/* Check-ins layer */}
        <Source id="checkins-source" type="geojson" data={checkinGeo}>
          <Layer
            id="checkins-heat"
            type="heatmap"
            paint={CHECKIN_PAINT}
            layout={{ visibility: activeLayer === "checkins" ? "visible" : "none" }}
          />
        </Source>

        {/* Neighborhoods layer */}
        <Source id="neighborhoods-source" type="geojson" data={neighborhoodGeo}>
          <Layer
            id="neighborhoods-heat"
            type="heatmap"
            paint={NEIGHBORHOOD_PAINT}
            layout={{ visibility: activeLayer === "neighborhoods" ? "visible" : "none" }}
          />
        </Source>

        {/* User location pin */}
        {userLocation && (
          <Marker longitude={userLocation.lon} latitude={userLocation.lat} anchor="center">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-16 h-16 rounded-full bg-blue-500/20 animate-ping" />
              <div className="absolute w-10 h-10 rounded-full bg-blue-500/15" />
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
            </div>
          </Marker>
        )}

        {/* Venue detail popup */}
        {selectedVenue && (
          <Popup
            longitude={selectedVenue.lon}
            latitude={selectedVenue.lat}
            anchor="bottom"
            onClose={() => setSelectedVenue(null)}
            closeOnClick={false}
            maxWidth="280px"
          >
            <div className="card-paper rounded-xl p-4 font-sans text-white min-w-[240px]">
              {sessionSent ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <span className="text-cyan text-lg font-semibold">Request Sent!</span>
                  <span className="text-xs text-white/50">
                    The venue owner will review your request.
                  </span>
                </div>
              ) : requestMode ? (
                <div className="flex flex-col gap-3">
                  <h3 className="text-base font-semibold">{selectedVenue.name}</h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-white/50">
                      Preferred time
                    </label>
                    <input
                      type="text"
                      placeholder="Today 2-5pm"
                      value={requestTime}
                      onChange={(e) => setRequestTime(e.target.value)}
                      className="w-full rounded-lg input-paper py-2 px-3 text-xs bg-transparent text-white placeholder:text-white/30 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-white/50">
                      Notes
                    </label>
                    <input
                      type="text"
                      placeholder="Need WiFi and outlets"
                      value={requestNotes}
                      onChange={(e) => setRequestNotes(e.target.value)}
                      className="w-full rounded-lg input-paper py-2 px-3 text-xs bg-transparent text-white placeholder:text-white/30 outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRequestMode(false)}
                      className="flex-1 btn-press text-xs font-medium rounded-lg px-3 py-2 bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendRequest}
                      disabled={requestSending}
                      className="flex-1 btn-press text-xs font-medium rounded-lg px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-navy-900 font-semibold transition-colors disabled:opacity-60"
                    >
                      {requestSending ? "Sending..." : "Send Request"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-base font-semibold mb-1">{selectedVenue.name}</h3>
                  <p className="text-xs text-white/60 mb-2">
                    {selectedVenue.neighborhood}
                    {selectedVenue.address ? `, ${selectedVenue.address}` : ""}
                  </p>

                  {selectedVenue.hours && (
                    <p className="text-xs text-white/50 mb-1">Hours: {selectedVenue.hours}</p>
                  )}

                  {selectedVenue.community_mode ? (
                    <span className="inline-block text-[10px] uppercase tracking-wider bg-cyan-500/20 text-cyan-300 rounded-full px-2 py-0.5 mb-2">
                      Community Mode
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] uppercase tracking-wider bg-white/5 text-white/40 rounded-full px-2 py-0.5 mb-2">
                      Community Mode: Off
                    </span>
                  )}

                  {selectedVenue.notes && (
                    <p className="text-xs text-white/40 italic mb-3">{selectedVenue.notes}</p>
                  )}

                  {user?.telegramId ? (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleRequestInfo}
                        disabled={infoSent}
                        className="flex-1 btn-press text-xs font-medium rounded-lg px-3 py-2 bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-60"
                      >
                        {infoSent ? "Sent!" : "Request Info"}
                      </button>
                      {selectedVenue.community_mode ? (
                        <button
                          onClick={handleEnterRequestMode}
                          className="flex-1 btn-press text-xs font-medium rounded-lg px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-navy-900 font-semibold transition-colors"
                        >
                          Request Session
                        </button>
                      ) : (
                        <span className="flex-1 text-xs text-center text-white/30 py-2">
                          Not accepting sessions
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-white/40 mt-2">
                      Log in to request info or sessions.
                    </p>
                  )}
                </>
              )}
            </div>
          </Popup>
        )}
      </Map>

      {/* Locate me */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleLocateMe}
          disabled={locationStatus === "requesting"}
          className="flex items-center gap-1.5 bg-navy-900/80 backdrop-blur-sm rounded-lg px-3 py-2 text-white hover:bg-navy-900 transition-colors disabled:opacity-50"
        >
          <LocateFixed
            className={`w-4 h-4 ${locationStatus === "requesting" ? "animate-pulse" : locationStatus === "granted" ? "text-cyan" : ""}`}
          />
          <span className="text-sm font-sans">
            {locationStatus === "requesting" ? "Locating..." : "My Location"}
          </span>
        </button>
      </div>

      {/* Layer toggle bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-1 bg-navy-900/80 backdrop-blur-sm rounded-xl p-1">
        {(Object.keys(LAYER_LABELS) as LayerKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActiveLayer(key)}
            className={`px-4 py-2 rounded-lg text-sm font-sans font-medium transition-colors ${
              activeLayer === key
                ? "bg-white text-navy-900"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {LAYER_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="absolute top-4 right-4 z-10 w-64">
        <div className="flex items-center gap-2 bg-navy-900/80 backdrop-blur-sm rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-white/50 shrink-0" />
          <input
            type="text"
            placeholder="Search venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none font-sans"
          />
        </div>
        {searchFocused && searchResults.length > 0 && (
          <div className="mt-1 bg-navy-900/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg">
            {searchResults.map((v) => (
              <button
                key={v.id}
                onMouseDown={() => handleSearchSelect(v)}
                className="w-full text-left px-3 py-2 hover:bg-white/10 transition-colors"
              >
                <span className="text-sm text-white font-sans">{v.name}</span>
                {v.neighborhood && (
                  <span className="text-xs text-white/40 ml-2 font-sans">{v.neighborhood}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
