"use client";

declare global {
	interface Window {
		dataLayer?: unknown[];
	}
}

let loadedId: string | null = null;

/**
 * Injects Google Tag Manager. Lets the admin/marketer add or change other
 * tracking tags themselves later through the GTM web UI, without needing a
 * code change. Idempotent, same pattern as loadFacebookPixel.
 */
export function loadGTM(containerId: string) {
	if (!containerId || loadedId === containerId) return;
	loadedId = containerId;

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

	const script = document.createElement("script");
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
	document.head.appendChild(script);
}
