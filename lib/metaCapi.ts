import "server-only";
import { createHash } from "node:crypto";

function sha256(value: string): string {
	return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/**
 * Sends a Purchase event straight from the server to Meta's Conversions
 * API, as a backup to the browser pixel -- ad blockers, Safari/iOS privacy
 * settings, and slow connections all cause real purchases to never reach
 * Meta from the browser alone. eventId must match the eventID passed to the
 * client-side fbq('track','Purchase', ..., {eventID}) call so Meta
 * deduplicates the two instead of double-counting the sale. Best-effort --
 * never throws, since a tracking failure must never block a real order.
 */
export async function sendMetaPurchaseEvent({
	pixelId,
	accessToken,
	testEventCode,
	eventId,
	value,
	phone,
	clientIp,
	userAgent,
	fbp,
	fbc,
	eventSourceUrl,
}: {
	pixelId: string;
	accessToken: string;
	/** Temporary debug code from Events Manager -> Test Events; omit once verified. */
	testEventCode?: string;
	eventId: string;
	value: number;
	phone: string;
	clientIp: string | null;
	userAgent: string | null;
	fbp: string | null;
	fbc: string | null;
	eventSourceUrl: string;
}) {
	if (!pixelId || !accessToken) return;

	// Same normalization as the browser pixel's Advanced Matching -- digits
	// only, country-code-prefixed, no leading 0.
	const phoneForMatching = phone.replace(/\D/g, "").replace(/^0/, "880");

	const userData: Record<string, string> = {
		ph: sha256(phoneForMatching),
	};
	if (clientIp) userData.client_ip_address = clientIp;
	if (userAgent) userData.client_user_agent = userAgent;
	if (fbp) userData.fbp = fbp;
	if (fbc) userData.fbc = fbc;

	const body: Record<string, unknown> = {
		data: [
			{
				event_name: "Purchase",
				event_time: Math.floor(Date.now() / 1000),
				event_id: eventId,
				event_source_url: eventSourceUrl,
				action_source: "website",
				user_data: userData,
				custom_data: {
					value,
					currency: "BDT",
				},
			},
		],
	};
	if (testEventCode) body.test_event_code = testEventCode;

	try {
		const res = await fetch(
			`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
				signal: AbortSignal.timeout(6000),
			},
		);
		const data = await res.json().catch(() => null);
		if (!res.ok) {
			console.error("Checkout: Meta Conversions API rejected event:", res.status, data);
		}
	} catch (err) {
		console.error("Checkout: Meta Conversions API request failed:", err);
	}
}
