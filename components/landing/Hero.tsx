import type { Product } from "@/lib/db/schema";
import HeroGallery from "./HeroGallery";

export default function Hero({ product: p }: { product: Product }) {
	const savings = p.comparePrice ? p.comparePrice - p.price : 0;

	return (
		<section
			className="relative overflow-hidden text-white"
			style={{ background: "linear-gradient(180deg, #212121 0%, #878787 100%)" }}
		>
			<div className="container-page relative z-10 py-12 text-center sm:py-16">
				<div className="mx-auto max-w-5xl">
					<h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-6xl">
						{p.title}
					</h1>
					<p className="mx-auto mt-3 text-sm sm:text-base md:text-[28px] text-white/75">
						{p.subtitle}
					</p>

					<div className="mt-4 flex items-center justify-center gap-2.5 text-sm sm:text-2xl">
						{p.comparePrice ? (
							<span className="text-white/50 line-through">
								{p.comparePrice} TK
							</span>
						) : null}
						<span className="text-lg sm:text-4xl! font-bold text-brand">
							{p.price} TK
						</span>
						{savings > 0 ? (
							<span className="font-medium text-white/80">
								Save {savings} TK
							</span>
						) : null}
					</div>

					<a
						href="#order"
						className="mt-6 inline-block rounded-xs bg-brand px-10 py-4 text-base sm:mt-8 sm:px-14 sm:py-5 sm:text-xl md:text-2xl font-bold text-white shadow-lg transition-colors hover:bg-brand-dark"
					>
						{p.heroCtaLabel}
					</a>
				</div>

				<div className="mt-8 sm:mt-10">
					<HeroGallery images={p.images} alt={p.title} />
				</div>
			</div>
		</section>
	);
}
