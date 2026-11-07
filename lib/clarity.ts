"use client";

declare global {
	interface Window {
		clarity?: (...args: unknown[]) => void;
	}
}

let loadedId: string | null = null;

/**
 * Injects Microsoft Clarity -- free session recordings and heatmaps, a
 * different kind of tool from the conversion pixels above: it shows HOW
 * visitors behave (scroll, clicks, time on page, session replay) rather
 * than firing discrete events. Idempotent, same pattern as loadFacebookPixel.
 */
export function loadClarity(projectId: string) {
	if (!projectId || loadedId === projectId) return;
	loadedId = projectId;

	/* eslint-disable */
	(function (c: any, l: Document, a: string, r: string, i: string) {
		c[a] = c[a] || function () {
			(c[a].q = c[a].q || []).push(arguments);
		};
		const t = l.createElement(r) as HTMLScriptElement;
		t.async = true;
		t.src = "https://www.clarity.ms/tag/" + i;
		const y = l.getElementsByTagName(r)[0];
		y.parentNode!.insertBefore(t, y);
	})(window, document, "clarity", "script", projectId);
	/* eslint-enable */
}
