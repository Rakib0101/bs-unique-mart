"use client";

import { useEffect } from "react";
import { captureUtmParams } from "@/lib/utm";

/** No visual output -- just saves ad-campaign attribution on first load. */
export default function UtmCapture() {
	useEffect(() => {
		captureUtmParams();
	}, []);

	return null;
}
