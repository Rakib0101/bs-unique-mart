"use client";

type TtqFn = {
	(...args: unknown[]): void;
	track: (...args: unknown[]) => void;
	page: (...args: unknown[]) => void;
};

declare global {
	interface Window {
		ttq?: TtqFn;
	}
}

let loadedPixelId: string | null = null;

/** Injects the TikTok Pixel base script. Idempotent, same pattern as loadFacebookPixel. */
export function loadTikTokPixel(pixelId: string) {
	if (!pixelId || loadedPixelId === pixelId) return;
	loadedPixelId = pixelId;

	/* eslint-disable */
	(function (w: any, d: Document, t: string) {
		w.TiktokAnalyticsObject = t;
		var ttq = (w[t] = w[t] || []);
		ttq.methods = [
			"page", "track", "identify", "instances", "debug", "on", "off", "once",
			"ready", "alias", "group", "enableCookie", "disableCookie",
			"holdConsent", "revokeConsent", "grantConsent",
		];
		ttq.setAndDefer = function (target: any, method: string) {
			target[method] = function () {
				target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
			};
		};
		for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
		ttq.instance = function (id: string) {
			var e = ttq._i[id] || [];
			for (var n = 0; n < e.length; n++) ttq.setAndDefer(e, e[n]);
			return e;
		};
		ttq.load = function (id: string) {
			var url = "https://analytics.tiktok.com/i18n/pixel/events.js";
			ttq._i = ttq._i || {};
			ttq._i[id] = [];
			ttq._i[id]._u = url;
			ttq._t = ttq._t || {};
			ttq._t[id] = Date.now();
			ttq._o = ttq._o || {};
			ttq._o[id] = {};
			var script = d.createElement("script");
			script.type = "text/javascript";
			script.async = true;
			script.src = url + "?sdkid=" + id + "&lib=" + t;
			var first = d.getElementsByTagName("script")[0];
			first.parentNode!.insertBefore(script, first);
		};
		ttq.load(pixelId);
		ttq.page();
	})(window, document, "ttq");
	/* eslint-enable */
}
