"use client";

/**
 * Registers /sw.js (production only, so dev hot-reload is never intercepted).
 * Visitors can opt out of the worker for debugging with ?nosw.
 */
import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    if (new URLSearchParams(window.location.search).has("nosw")) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        /* the site works fine without it */
      });
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
