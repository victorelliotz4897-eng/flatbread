import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function SiteNav({ places = [] }) {
  const tickerText = places.map((place) => place).join(" • ");
  const [isPizzaFalling, setIsPizzaFalling] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let timeout;
    let clearTimer;
    const closeMenuOnRouteChange = () => setMobileMenuOpen(false);

    const triggerFall = () => {
      setIsPizzaFalling(false);
      clearTimeout(timeout);
      clearTimeout(clearTimer);

      timeout = setTimeout(() => setIsPizzaFalling(true), 15);
      clearTimer = setTimeout(() => setIsPizzaFalling(false), 2800);
    };

    triggerFall();
    router.events.on("routeChangeComplete", closeMenuOnRouteChange);
    router.events.on("routeChangeStart", triggerFall);

    return () => {
      router.events.off("routeChangeComplete", closeMenuOnRouteChange);
      router.events.off("routeChangeStart", triggerFall);
      clearTimeout(timeout);
      clearTimeout(clearTimer);
    };
  }, [router.events]);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="top-nav">
      <div className="top-nav-row">
        <div className="brand-row">
          <Link href="/" className="logo">
            Flatbread Night
          </Link>
        </div>
        <div className="menu-shell">
          <button
            type="button"
            className="menu-toggle"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? "×" : "🍕"}
          </button>
          <nav className={mobileMenuOpen ? "is-open" : ""} aria-label="Primary">
            <Link href="/about" prefetch={false} onClick={closeMenu}>
              <span aria-hidden>🍕</span>
              <span>About</span>
            </Link>
            <Link href="/places" prefetch={false} onClick={closeMenu}>
              <span aria-hidden>🍕</span>
              <span>Places</span>
            </Link>
            <Link href="/rules" prefetch={false} onClick={closeMenu}>
              <span aria-hidden>🍕</span>
              <span>Rules</span>
            </Link>
            <Link href="/rankings" prefetch={false} onClick={closeMenu}>
              <span aria-hidden>🍕</span>
              <span>Rankings</span>
            </Link>
            <Link href="/high-fives" prefetch={false} onClick={closeMenu}>
              <span aria-hidden>🍕</span>
              <span>High Fives</span>
            </Link>
            <Link href="/honor" prefetch={false} onClick={closeMenu}>
              <span aria-hidden>🍕</span>
              <span>Honor</span>
            </Link>
          </nav>
        </div>
      </div>
      <div className={`pizza-rain ${isPizzaFalling ? "active" : ""}`} aria-hidden="true">
        <span>🍕</span>
        <span>🍕</span>
        <span>🍕</span>
      </div>

      {places.length > 0 ? (
        <div className="header-ticker" role="status" aria-live="polite">
          <div className="header-ticker__track" aria-hidden="true">
            <span className="header-ticker__text">{tickerText}</span>
            <span className="header-ticker__text">{tickerText}</span>
          </div>
        </div>
      ) : null}
    </header>
  );
}
