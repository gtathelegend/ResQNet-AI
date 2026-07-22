"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "[SW] Service Worker registered with scope:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error("[SW] Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}
