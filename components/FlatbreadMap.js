import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";

const secretSpots = [
  {
    name: "Governor's Island Secret Spot",
    address: "Governor's Island, NY",
    lat: 40.6894,
    lng: -74.0166,
    galleryUrl: "/gallery",
    isSecretGallery: true,
    isClosed: false
  }
];

const HOST_ALL_LABEL = "All";
const HOST_FALLBACK_LABEL = "Host TBD";

function escapeHtml(value) {
  const text = String(value || "");
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatHostLine(hostUserId, hostNameById) {
  const hostId = String(hostUserId || "").trim();
  if (!hostId) {
    return "";
  }
  if (hostId === "all") {
    return HOST_ALL_LABEL;
  }
  const hostName = hostNameById?.[hostId];
  return hostName ? String(hostName).trim() : "";
}

function formatHostHtml(hostUserId, hostNameById) {
  const label = formatHostLine(hostUserId, hostNameById);
  if (!label) {
    return "";
  }
  return `<p class="map-popup-host"><em>by ${escapeHtml(label)}</em></p>`;
}

function buildHostHtml(hostUserId, hostNameById, fallback = true) {
  const label = formatHostLine(hostUserId, hostNameById);
  if (!label) {
    return fallback
      ? `<p class="map-popup-host"><em>by ${escapeHtml(HOST_FALLBACK_LABEL)}</em></p>`
      : "";
  }
  return `<p class="map-popup-host"><em>by ${escapeHtml(label)}</em></p>`;
}

function clusterPin(size, isCluster, isClosed) {
  const iconText = isClosed ? "🪦" : "🍕";
  return new L.DivIcon({
    className: isCluster ? "map-cluster-pin" : "map-pin",
    html: isCluster
      ? `<span class="pizza-pin-glyph">${iconText}${size}</span>`
      : `<span class="pizza-pin-glyph">${iconText}</span>`,
    iconSize: isCluster ? [30, 30] : [22, 22],
    iconAnchor: isCluster ? [15, 15] : [11, 11]
  });
}

const CLUSTER_DISTANCE = 0.00018; // about 20m

function clusterLocations(locations) {
  const grouped = [];

  for (const location of locations) {
    if (location.isClosed || location.isSecretGallery) {
      grouped.push({
        lat: location.lat,
        lng: location.lng,
        anchor: location,
        items: [location]
      });
      continue;
    }

    const existing = grouped.find((group) => {
      if (group.anchor.isClosed || group.anchor.isSecretGallery) {
        return false;
      }
      const latDiff = Math.abs(group.lat - location.lat);
      const lngDiff = Math.abs(group.lng - location.lng);
      return latDiff < CLUSTER_DISTANCE && lngDiff < CLUSTER_DISTANCE;
    });

    if (existing) {
      existing.items.push(location);
      // Keep the pin anchored to one of the original points for better visual precision.
      existing.anchor = existing.anchor || existing.items[0];
      continue;
    }

    grouped.push({
      lat: location.lat,
      lng: location.lng,
      anchor: location,
      items: [location]
    });
  }

  return grouped;
}

export default function FlatbreadMap({ locations, hostNameById = {} }) {
  const clusters = useMemo(
    () => clusterLocations([...locations, ...secretSpots]),
    [locations]
  );

  return (
    <MapContainer
      center={[40.74, -73.98]}
      zoom={11}
      scrollWheelZoom={false}
      className="flatbread-map"
      aria-label="Interactive map of flatbread locations"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {clusters.map((cluster, index) => {
        const hasMultiple = cluster.items.length > 1;
        const popupItem = !hasMultiple ? cluster.items[0] : null;
        const isSecretGallerySpot = popupItem?.isSecretGallery && popupItem?.galleryUrl;
        const isClosedSpot = popupItem?.isClosed;
        const allClosed = cluster.items.length > 1 && cluster.items.every((item) => item?.isClosed);
        const graveyardLink = `<p class="map-gallery-link-wrap"><a class="graveyard-link" href="/tombstones">Graveyard</a></p>`;
        const galleryLink = popupItem?.galleryUrl
          ? `<p class="map-gallery-link-wrap"><a href="${popupItem.galleryUrl}" target="_blank" rel="noopener noreferrer">Make the Pizza</a></p>`
          : "";
        const popupTitle = !hasMultiple && isSecretGallerySpot
          ? ""
          : hasMultiple
            ? `<strong>${cluster.items.length} places</strong>`
            : (isClosedSpot ? "" : `<strong>${popupItem?.name || ""}</strong>`);
        const popupList = hasMultiple
          ? `<div class=\"map-cluster-address\">${cluster.items
              .map((item) => `<div><strong>${escapeHtml(item?.name || "")}</strong><br/><small>${escapeHtml(item?.date || "")}</small><small class=\"map-location\">${escapeHtml(item?.address || "")}</small>${buildHostHtml(item?.hostUserId, hostNameById)}</div>`)
              .join("<hr/>")}</div>`
          : (isSecretGallerySpot
            ? `${galleryLink}`
            : (isClosedSpot
              ? `${graveyardLink}`
              : `${popupTitle}<p>${popupItem?.date ? `${escapeHtml(popupItem.date)}<br/>` : ""}<small class=\"map-location\">${escapeHtml(popupItem?.address || "")}</small></p>${buildHostHtml(popupItem?.hostUserId, hostNameById, true)}`));
        const popupContent = allClosed
          ? graveyardLink
          : isSecretGallerySpot
            ? `${galleryLink}`
            : hasMultiple
              ? `${popupTitle}${popupList}`
              : popupList;

        return (
          <Marker
            key={`${cluster.lat}-${cluster.lng}-${index}`}
            position={[cluster.anchor.lat, cluster.anchor.lng]}
            icon={clusterPin(cluster.items.length, hasMultiple, allClosed || isClosedSpot)}
          >
            <Popup>
              <div
                className="map-popup"
                dangerouslySetInnerHTML={{ __html: popupContent }}
              />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
