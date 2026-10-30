"use client";

type FbqFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: unknown;
  }
}

let loadedPixelId: string | null = null;

/**
 * Injects the Meta Pixel base script. Idempotent and safe to call from
 * multiple places (interaction listeners, idle fallback, a tracking call
 * that needs the pixel sooner than either of those fired) -- only the
 * first call actually does anything. Once this has run, window.fbq exists
 * as the standard queueing stub, so any fbq(...) call made before
 * fbevents.js finishes downloading is queued and replayed automatically,
 * not lost.
 */
export function loadFacebookPixel(pixelId: string) {
  if (!pixelId || loadedPixelId === pixelId) return;
  loadedPixelId = pixelId;

  /* eslint-disable */
  (function (f: any, b: Document, e: string, v: string, n: any, t: any, s: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js", undefined, undefined, undefined);
  /* eslint-enable */

  window.fbq!("set", "autoConfig", false, pixelId);
  window.fbq!("init", pixelId);
  window.fbq!("track", "PageView");
}
