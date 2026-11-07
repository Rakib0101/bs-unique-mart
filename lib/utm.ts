"use client";

const STORAGE_KEY = "bsum_utm";

export type StoredUtm = {
	utmSource: string;
	utmMedium: string;
	utmCampaign: string;
};

const EMPTY: StoredUtm = { utmSource: "", utmMedium: "", utmCampaign: "" };

/**
 * Reads utm_* params from the current URL and saves them for the rest of the
 * browsing session, so an order placed after navigating away from the
 * landing link (e.g. to a related product, then back) still carries the
 * campaign that brought the visitor in. First-touch within the session wins
 * -- a later page view without utm params doesn't overwrite an earlier one.
 */
export function captureUtmParams() {
	if (typeof window === "undefined") return;
	const params = new URLSearchParams(window.location.search);
	const source = params.get("utm_source");
	if (!source) return;

	try {
		if (window.sessionStorage.getItem(STORAGE_KEY)) return;
		const value: StoredUtm = {
			utmSource: source,
			utmMedium: params.get("utm_medium") || "",
			utmCampaign: params.get("utm_campaign") || "",
		};
		window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
	} catch {
		// sessionStorage unavailable (private browsing, etc.) -- attribution
		// is a nice-to-have, never worth breaking the page over.
	}
}

export function getStoredUtmParams(): StoredUtm {
	if (typeof window === "undefined") return EMPTY;
	try {
		const raw = window.sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return EMPTY;
		return { ...EMPTY, ...JSON.parse(raw) };
	} catch {
		return EMPTY;
	}
}
