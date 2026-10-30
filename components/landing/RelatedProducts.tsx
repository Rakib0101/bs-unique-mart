import Image from "next/image";
import Link from "next/link";
import content from "@/data/site.json";
import { formatPrice } from "@/lib/format";
import type { ColorOption } from "@/lib/types";

type RelatedProduct = {
	slug: string;
	title: string;
	price: number;
	images: string[];
	colors: ColorOption[];
};

export default function RelatedProducts({ products }: { products: RelatedProduct[] }) {
	if (products.length === 0) return null;

	return (
		<section id="related" className="py-10 sm:py-[60px] bg-white">
			<div className="container-page text-center">
				<p className="text-sm font-semibold uppercase tracking-wide text-brand">
					{content.relatedSection.eyebrow}
				</p>
				<h2 className="mt-2 text-2xl font-bold sm:text-3xl text-ink">
					{content.relatedSection.title}
				</h2>

				<div className="mt-8 grid grid-cols-2 gap-4 text-left lg:grid-cols-4">
					{products.map((other) => (
						<Link
							key={other.slug}
							href={`/products/${other.slug}`}
							className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white text-left transition-all hover:border-ink/40"
						>
							<Image
								src={other.images[0]}
								alt={other.title}
								width={600}
								height={750}
								sizes="(max-width: 1023px) 45vw, 25vw"
								className="aspect-4/5 w-full object-cover"
							/>
							<div className="p-3">
								<p className="line-clamp-2 text-base font-bold text-ink">
									{other.title}
								</p>
								<div className="mt-1 flex items-center justify-between gap-2">
									<span className="text-lg font-bold text-brand">
										{formatPrice(other.price)}
									</span>
									<div className="flex gap-1">
										{other.colors.map((c) => (
											<span
												key={c.name}
												className="h-3 w-3 rounded-full border border-black/10"
												style={{ background: c.hex }}
											/>
										))}
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
