"use client";

import { useEffect } from "react";
import { loadFacebookPixel } from "@/lib/pixel";

const IMMEDIATE_TRIGGER_EVENTS = ["pointerdown", "keydown", "touchstart"] as const;
// The homepage auto-scrolls to the checkout section ~400ms after load (see
// ScrollToTop.tsx), which fires a native "scroll" event that isn't a real
// user interaction -- listening for scroll only after that animation has
// had time to finish avoids treating our own code as the trigger.
const SCROLL_TRIGGER_DELAY_MS = 2000;
const IDLE_FALLBACK_MS = 5000;

/**
 * Defers loading fbevents.js (~200KB) until the visitor actually does
 * something, instead of blocking/competing with the initial page load.
 * Falls back to an idle timer so the pixel still loads on a visit with no
 * interaction at all (e.g. someone who just reads the page and leaves).
 */
export default function FacebookPixel({ pixelId }: { pixelId: string }) {
  useEffect(() => {
    if (!pixelId) return;

    let settled = false;
    let idleCallbackId: number | undefined;
    const allEvents = [...IMMEDIATE_TRIGGER_EVENTS, "scroll"] as const;

    const load = () => {
      if (settled) return;
      settled = true;
      loadFacebookPixel(pixelId);
      allEvents.forEach((evt) => window.removeEventListener(evt, load));
      clearTimeout(scrollListenerTimer);
      clearTimeout(fallbackTimer);
      if (idleCallbackId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleCallbackId);
      }
    };

    IMMEDIATE_TRIGGER_EVENTS.forEach((evt) => window.addEventListener(evt, load, { passive: true, once: true }));

    const scrollListenerTimer = setTimeout(() => {
      window.addEventListener("scroll", load, { passive: true, once: true });
    }, SCROLL_TRIGGER_DELAY_MS);

    const fallbackTimer = setTimeout(() => {
      if ("requestIdleCallback" in window) {
        idleCallbackId = window.requestIdleCallback(load, { timeout: 2000 });
      } else {
        load();
      }
    }, IDLE_FALLBACK_MS);

    return () => {
      allEvents.forEach((evt) => window.removeEventListener(evt, load));
      clearTimeout(scrollListenerTimer);
      clearTimeout(fallbackTimer);
      if (idleCallbackId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleCallbackId);
      }
    };
  }, [pixelId]);

  return null;
}
