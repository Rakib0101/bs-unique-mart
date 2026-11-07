"use client";

import { useEffect } from "react";
import { loadFacebookPixel } from "@/lib/pixel";
import { loadTikTokPixel } from "@/lib/tiktok";
import { loadGA4 } from "@/lib/ga4";
import { loadGTM } from "@/lib/gtm";

const IMMEDIATE_TRIGGER_EVENTS = ["pointerdown", "keydown", "touchstart"] as const;
// The homepage auto-scrolls to the checkout section ~400ms after load (see
// ScrollToTop.tsx), which fires a native "scroll" event that isn't a real
// user interaction -- listening for scroll only after that animation has
// had time to finish avoids treating our own code as the trigger.
const SCROLL_TRIGGER_DELAY_MS = 2000;
const IDLE_FALLBACK_MS = 5000;

/**
 * Defers loading every ad/analytics script until the visitor actually does
 * something, instead of blocking/competing with the initial page load.
 * Falls back to an idle timer so they still load on a visit with no
 * interaction at all (e.g. someone who just reads the page and leaves).
 */
export default function MarketingScripts({
	fbPixelId,
	tiktokPixelId,
	ga4MeasurementId,
	gtmContainerId,
}: {
	fbPixelId: string;
	tiktokPixelId: string;
	ga4MeasurementId: string;
	gtmContainerId: string;
}) {
	useEffect(() => {
		if (!fbPixelId && !tiktokPixelId && !ga4MeasurementId && !gtmContainerId) return;

		let settled = false;
		let idleCallbackId: number | undefined;
		const allEvents = [...IMMEDIATE_TRIGGER_EVENTS, "scroll"] as const;

		const loadAll = () => {
			if (settled) return;
			settled = true;
			if (fbPixelId) loadFacebookPixel(fbPixelId);
			if (tiktokPixelId) loadTikTokPixel(tiktokPixelId);
			if (ga4MeasurementId) loadGA4(ga4MeasurementId);
			if (gtmContainerId) loadGTM(gtmContainerId);
			allEvents.forEach((evt) => window.removeEventListener(evt, loadAll));
			clearTimeout(scrollListenerTimer);
			clearTimeout(fallbackTimer);
			if (idleCallbackId !== undefined && "cancelIdleCallback" in window) {
				window.cancelIdleCallback(idleCallbackId);
			}
		};

		IMMEDIATE_TRIGGER_EVENTS.forEach((evt) => window.addEventListener(evt, loadAll, { passive: true, once: true }));

		const scrollListenerTimer = setTimeout(() => {
			window.addEventListener("scroll", loadAll, { passive: true, once: true });
		}, SCROLL_TRIGGER_DELAY_MS);

		const fallbackTimer = setTimeout(() => {
			if ("requestIdleCallback" in window) {
				idleCallbackId = window.requestIdleCallback(loadAll, { timeout: 2000 });
			} else {
				loadAll();
			}
		}, IDLE_FALLBACK_MS);

		return () => {
			allEvents.forEach((evt) => window.removeEventListener(evt, loadAll));
			clearTimeout(scrollListenerTimer);
			clearTimeout(fallbackTimer);
			if (idleCallbackId !== undefined && "cancelIdleCallback" in window) {
				window.cancelIdleCallback(idleCallbackId);
			}
		};
	}, [fbPixelId, tiktokPixelId, ga4MeasurementId, gtmContainerId]);

	return null;
}
