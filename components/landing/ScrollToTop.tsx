"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
		}, 400);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		const onScroll = () => setVisible(window.scrollY > 300);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<button
			type="button"
			onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
			aria-label="Scroll to top"
			className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-opacity duration-300 hover:bg-brand-dark ${
				visible ? "opacity-100" : "pointer-events-none opacity-0"
			}`}
		>
			<svg
				className="h-5 w-5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M12 19V5" />
				<path d="M5 12l7-7 7 7" />
			</svg>
		</button>
	);
}
