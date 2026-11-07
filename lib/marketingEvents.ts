"use client";

import { loadFacebookPixel } from "@/lib/pixel";
import { loadTikTokPixel } from "@/lib/tiktok";
import { loadGA4 } from "@/lib/ga4";

export type MarketingIds = {
	fbPixelId: string;
	tiktokPixelId: string;
	ga4MeasurementId: string;
};

function pushToDataLayer(event: Record<string, unknown>) {
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push(event);
}

/** Fires once when a visitor starts filling the order form -- the signal a
 *  marketer needs to retarget "almost bought" visitors with ads. */
export function trackInitiateCheckout(ids: MarketingIds, value: number) {
	if (typeof window === "undefined") return;

	if (ids.fbPixelId) {
		loadFacebookPixel(ids.fbPixelId);
		window.fbq?.("track", "InitiateCheckout", { value, currency: "BDT" });
	}
	if (ids.tiktokPixelId) {
		loadTikTokPixel(ids.tiktokPixelId);
		window.ttq?.track("InitiateCheckout", { value, currency: "BDT" });
	}
	if (ids.ga4MeasurementId) {
		loadGA4(ids.ga4MeasurementId);
		window.gtag?.("event", "begin_checkout", { value, currency: "BDT" });
	}
	pushToDataLayer({ event: "begin_checkout", value, currency: "BDT" });
}

/** Fires once, only after the order is confirmed saved. eventId is shared
 *  with the server-side Meta Conversions API call so Meta can deduplicate
 *  the browser and server copies of the same Purchase. */
export function trackPurchase(ids: MarketingIds, value: number, phone: string, eventId: string) {
	if (typeof window === "undefined") return;
	// Advanced Matching needs digits-only, country-code-prefixed phone (no
	// leading 0, no "+") -- e.g. 01712345678 -> 8801712345678.
	const phoneForMatching = phone.replace(/\D/g, "").replace(/^0/, "880");

	if (ids.fbPixelId) {
		loadFacebookPixel(ids.fbPixelId);
		// Re-init with the matching data right before the event, per Meta's
		// manual Advanced Matching pattern.
		window.fbq?.("init", ids.fbPixelId, { ph: phoneForMatching });
		window.fbq?.("track", "Purchase", { value, currency: "BDT" }, { eventID: eventId });
	}
	if (ids.tiktokPixelId) {
		loadTikTokPixel(ids.tiktokPixelId);
		window.ttq?.track("CompletePayment", { value, currency: "BDT", event_id: eventId });
	}
	if (ids.ga4MeasurementId) {
		loadGA4(ids.ga4MeasurementId);
		window.gtag?.("event", "purchase", { value, currency: "BDT", transaction_id: eventId });
	}
	pushToDataLayer({ event: "purchase", value, currency: "BDT", transaction_id: eventId });
}
