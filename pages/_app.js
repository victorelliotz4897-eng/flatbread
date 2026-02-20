import { useEffect, useState } from "react";
import "../styles/globals.css";

const HONOR_LINES = [
  "🖖 To honor",
  "To getting honor",
  "To staying honor",
  "And if you can't come in her",
  "Come honor"
];

export default function App({ Component, pageProps }) {
  const [isHonorOpen, setIsHonorOpen] = useState(false);
  const [honorIndex, setHonorIndex] = useState(0);

  useEffect(() => {
    const onDocumentClick = (event) => {
      const trigger = event.target?.closest?.("[data-honor-trigger='true']");
      if (!trigger) {
        return;
      }
      event.preventDefault();
      setHonorIndex(0);
      setIsHonorOpen(true);
    };

    const onDocumentKeyDown = (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      const trigger = event.target?.closest?.("[data-honor-trigger='true']");
      if (!trigger) {
        return;
      }
      event.preventDefault();
      setHonorIndex(0);
      setIsHonorOpen(true);
    };

    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onDocumentKeyDown);
    return () => {
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!isHonorOpen) {
      return;
    }
    const interval = setInterval(() => {
      setHonorIndex((previous) => (previous + 1) % HONOR_LINES.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [isHonorOpen]);

  return (
    <>
      <Component {...pageProps} />
      {isHonorOpen ? (
        <div className="honor-modal-backdrop" onClick={() => setIsHonorOpen(false)}>
          <div
            className="honor-modal"
            role="dialog"
            aria-modal="true"
            aria-label="To honor toast"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="honor-close"
              onClick={() => setIsHonorOpen(false)}
              aria-label="Close"
            >
              x
            </button>
            <p className="honor-line">{HONOR_LINES[honorIndex]}</p>
            <p className="honor-emoji" aria-hidden="true">🍻</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
