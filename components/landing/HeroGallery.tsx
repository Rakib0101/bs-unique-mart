"use client";

import Image from "next/image";
import { useState } from "react";
import type { ColorOption } from "@/lib/types";

export interface GalleryItem {
	id: string;
	thumb: string;
	full: string;
	alt: string;
}

export default function HeroGallery({
	images,
	alt,
	colors,
}: {
	images?: string[];
	alt: string;
	colors?: ColorOption[];
}) {
	const [active, setActive] = useState(0);

	// Each photo doubles as its own thumbnail and full-size view.
	const items: GalleryItem[] = (images && images.length > 0 ? images : []).map(
		(img, idx) => ({
			id: `img-${idx}`,
			thumb: img,
			full: img,
			alt: `${alt} ${idx + 1}`,
		}),
	);

	const activeItem = items[active] || items[0];
	if (!activeItem) return null;

	return (
		<div className="mx-auto flex w-full flex-col items-center">
			{/* Active Image Showcase: responsive on mobile, max 430px height on desktop */}
			<div className="w-full max-w-[578px]">
				<div className="overflow-hidden border-8 sm:border-10 md:border-12 border-white bg-ink-soft shadow-2xl">
					<div className="relative aspect-900/670 w-full md:max-h-[430px]">
						<Image
							src={activeItem.full}
							alt={activeItem.alt || alt}
							fill
							sizes="(max-width: 768px) 95vw, 578px"
							className="object-cover"
							priority
						/>
					</div>
				</div>
			</div>

			{/* Color Options: click a color to preview that variant */}
			{colors && colors.length > 0 ? (
				<div className="mt-4 flex flex-wrap items-center justify-center gap-2">
					<span className="text-xs font-medium text-white/70">কালার:</span>
					{colors.map((c, i) => {
						const targetImg = c.image || (images && images[i]) || "";
						const foundIdx = images ? images.indexOf(targetImg) : -1;
						const targetIdx = foundIdx !== -1 ? foundIdx : i;
						const isSelected = active === targetIdx;
						return (
							<button
								key={c.name}
								type="button"
								onClick={() => {
									if (targetIdx < items.length) {
										setActive(targetIdx);
									}
								}}
								className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-all cursor-pointer ${
									isSelected
										? "bg-white text-ink font-semibold shadow-md ring-2 ring-brand"
										: "bg-white/15 text-white/90 hover:bg-white/25"
								}`}
							>
								<span
									className="h-3 w-3 rounded-full border border-black/20"
									style={{ backgroundColor: c.hex }}
								/>
								<span>{c.name}</span>
							</button>
						);
					})}
				</div>
			) : null}

			{/* Thumbnails Row: narrower centered grid below active image */}
			{items.length > 1 ? (
				<div className="mt-4 sm:mt-5 flex items-center justify-center gap-2 sm:gap-3">
					{items.map((item, i) => (
						<button
							key={item.id}
							type="button"
							onClick={() => setActive(i)}
							aria-label={item.alt}
							className={`group relative h-14 w-14 sm:h-16 sm:w-16 md:h-18 md:w-18 overflow-hidden rounded-xs cursor-pointer transition-all duration-150 ${
								i === active
									? "border-2 border-brand"
									: "border border-white/20 opacity-75 hover:opacity-100 hover:border-white/50"
							}`}
						>
							<Image
								src={item.thumb}
								alt={item.alt}
								fill
								sizes="80px"
								className="object-cover transition-transform duration-200 group-hover:scale-105"
							/>
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}
