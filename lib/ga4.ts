"use client";

type GtagFn = (...args: unknown[]) => void;

declare global {
	interface Window {
		dataLayer?: unknown[];
		gtag?: GtagFn;
	}
}

let loadedId: string | null = null;

/** Injects Google Analytics 4 (gtag.js). Idempotent, same pattern as loadFacebookPixel. */
export function loadGA4(measurementId: string) {
	if (!measurementId || loadedId === measurementId) return;
	loadedId = measurementId;

	window.dataLayer = window.dataLayer || [];
	window.gtag = function (...args: unknown[]) {
		window.dataLayer!.push(args);
	};
	window.gtag("js", new Date());
	window.gtag("config", measurementId);

	const script = document.createElement("script");
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
	document.head.appendChild(script);
}
