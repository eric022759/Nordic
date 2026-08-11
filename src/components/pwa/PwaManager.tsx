"use client";

import { useEffect, useMemo } from "react";

interface ServiceWorkerCleanupProps {
  basePath?: string;
}

const CACHE_PREFIX = "nordic-trip-";
const INSTALL_DISMISSED_KEY = "nordic-trip-pwa-install-dismissed-at";
const RELOAD_GUARD_KEY = "nordic-trip-service-worker-cleanup-reloaded";

function normalizeBasePath(basePath: string) {
  if (!basePath || basePath === "/") return "";
  return `/${basePath.replace(/^\/+|\/+$/g, "")}`;
}

export function ServiceWorkerCleanup({ basePath = "" }: ServiceWorkerCleanupProps) {
  const normalizedBasePath = useMemo(() => normalizeBasePath(basePath), [basePath]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    const cleanup = async () => {
      const expectedScope = new URL(`${normalizedBasePath}/`, window.location.origin).href;
      const expectedWorkerUrl = new URL(`${normalizedBasePath}/sw.js`, window.location.origin);
      const controller = "serviceWorker" in navigator ? navigator.serviceWorker.controller : null;
      const controllerUrl = controller ? new URL(controller.scriptURL) : null;
      const hadTargetController =
        controllerUrl?.origin === expectedWorkerUrl.origin &&
        controllerUrl.pathname === expectedWorkerUrl.pathname;

      try {
        window.localStorage.removeItem(INSTALL_DISMISSED_KEY);
      } catch {
        // Storage can be blocked; cache and registration cleanup must still continue.
      }

      if ("caches" in window) {
        const cacheNames = await window.caches.keys().catch(() => []);
        await Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith(CACHE_PREFIX))
            .map((cacheName) => window.caches.delete(cacheName).catch(() => false)),
        );
      }

      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations().catch(() => []);
        await Promise.all(
          registrations
            .filter((registration) => registration.scope === expectedScope)
            .map((registration) => registration.unregister().catch(() => false)),
        );
      }

      if (hadTargetController && navigator.onLine) {
        try {
          if (window.sessionStorage.getItem(RELOAD_GUARD_KEY) === "1") {
            window.sessionStorage.removeItem(RELOAD_GUARD_KEY);
            return;
          }

          window.sessionStorage.setItem(RELOAD_GUARD_KEY, "1");
          window.location.reload();
          return;
        } catch {
          // Avoid an unguarded reload loop when session storage is unavailable.
        }
      }

      try {
        window.sessionStorage.removeItem(RELOAD_GUARD_KEY);
      } catch {
        // Storage can be blocked without affecting normal online navigation.
      }
    };

    void cleanup();
  }, [normalizedBasePath]);

  return null;
}
