import Head from "next/head";
import { useEffect, useState } from "react";
import SiteNav from "../components/SiteNav";
import { getAllPlaces, getConfiguredUsers, PLACE_LIST_SYNC_EVENT, hydratePlacesFromServer } from "../utils/rankingStore";
import styles from "../styles/Places.module.css";

const PLACE_HOST_ALL_LABEL = "All";

function buildHostNameById() {
  const users = getConfiguredUsers();
  const map = {};
  users.forEach((user) => {
    if (user?.id) {
      map[user.id] = user.name || user.id;
    }
  });
  return map;
}

function formatHost(place, hostNameById) {
  if (!place.hostUserId) {
    return "Host TBD";
  }
  if (place.hostUserId === "all") {
    return PLACE_HOST_ALL_LABEL;
  }
  return hostNameById[place.hostUserId] || place.hostUserId;
}

function normalizePlaces() {
  const hostNameById = buildHostNameById();
  return getAllPlaces()
    .slice()
    .sort((a, b) => b.visitDate - a.visitDate)
    .map((place) => ({
      id: place.id,
      name: place.name,
      date: place.date,
      address: place.address,
      hostName: formatHost(place, hostNameById),
      orderedItems: place.orderedItems || "—"
    }));
}

export default function PlacesPage() {
  const [places, setPlaces] = useState(() => normalizePlaces());

  useEffect(() => {
    const refreshPlaces = async () => {
      await hydratePlacesFromServer();
      setPlaces(normalizePlaces());
    };

    void refreshPlaces();
    window.addEventListener(PLACE_LIST_SYNC_EVENT, refreshPlaces);

    return () => {
      window.removeEventListener(PLACE_LIST_SYNC_EVENT, refreshPlaces);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Flatbread Night · Places</title>
        <meta
          name="description"
          content="Every Flatbread Night location, with date and address."
        />
      </Head>
      <SiteNav />
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.badge}>Places</p>
          <h1>Flatbread Night Places</h1>
          <p className={styles.lead}>
            Every place we&apos;ve gone for Flatbread Night, listed by most recent first.
          </p>

          <div className={styles.listWrap}>
            {places.map((place) => (
              <article key={place.id} className={styles.row}>
                <h2>{place.name}</h2>
                <p className={styles.date}>{place.date}</p>
                <p>{place.address}</p>
                <p className={styles.host}>by {place.hostName}</p>
                <p className={styles.order}>Ordered: {place.orderedItems}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
