import content from "@/data/site.json";
import Image from "next/image";

export default function QualityBanner({
	title,
	desc,
	badges,
	image,
}: {
	title: string;
	desc: string;
	badges: string[];
	image: string;
}) {
	return (
		<section className="bg-ink py-10 text-white sm:py-[60px]">
			<div className="container-page grid items-center gap-10 lg:grid-cols-2">
				<div>
					{content.qualityBanner.eyebrow ? (
						<p className="text-sm font-semibold uppercase tracking-wide text-brand">
							{content.qualityBanner.eyebrow}
						</p>
					) : null}
					<h2 className="text-2xl font-bold leading-snug sm:text-3xl">
						{title}
					</h2>
					<p className="mt-4 max-w-md text-white/70">{desc}</p>

					{badges.length > 0 ? (
						<div className="mt-6 flex flex-wrap gap-3">
							{badges.map((badge) => (
								<span
									key={badge}
									className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white/80"
								>
									{badge}
								</span>
							))}
						</div>
					) : null}
				</div>

				<Image
					src={image}
					alt={title || "Premium Quality Sunglasses"}
					width={710}
					height={584}
					className="w-full object-cover lg:order-last"
				/>
			</div>
		</section>
	);
}
