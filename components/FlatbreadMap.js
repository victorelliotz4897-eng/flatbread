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

export default function FlatbreadMap({ locations }) {
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
        const popupTitle = hasMultiple
          ? `<strong>${cluster.items.length} places</strong>`
          : (isSecretGallerySpot ? "" : (isClosedSpot ? "<strong>Venue closed</strong>" : `<strong>${popupItem?.name || ""}</strong>`));
        const galleryLink = popupItem?.galleryUrl
          ? `<p class="map-gallery-link-wrap"><a href="${popupItem.galleryUrl}" target="_blank" rel="noopener noreferrer">Make the Pizza</a></p>`
          : "";
        const tombstoneLink = isClosedSpot
          ? `<p class="map-gallery-link-wrap"><a href="/tombstones">View closed venues</a></p>`
          : "";
        const popupList = hasMultiple
          ? `<ul>${cluster.items
              .map((item) => `<li>${item.name}<br/><small>${item.date}</small></li>`)
              .join("")}</ul>`
          : (isSecretGallerySpot || isClosedSpot
            ? `${galleryLink}${tombstoneLink}`
            : `<p>${popupItem?.date ? `${popupItem.date}<br/>` : ""}<small class="map-location">${popupItem?.address || ""}</small></p>${tombstoneLink}`);
        const addressList = hasMultiple
          ? `<div class=\"map-cluster-address\">${cluster.items
              .map((item) => `<div><strong>${item.name}</strong><br/><small>${item.date}</small><small class=\"map-location\">${item.address}</small></div>`)
              .join("<hr/>")}</div>`
          : "";

        return (
          <Marker
            key={`${cluster.lat}-${cluster.lng}-${index}`}
            position={[cluster.anchor.lat, cluster.anchor.lng]}
            icon={clusterPin(cluster.items.length, hasMultiple, isClosedSpot)}
          >
            <Popup>
              <div
                className="map-popup"
                dangerouslySetInnerHTML={{ __html: `${popupTitle}${hasMultiple ? `${addressList}` : popupList}` }}
              />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
