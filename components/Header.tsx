import content from "@/data/site.json";
import Image from "next/image";
import Link from "next/link";

export default function Header({ logoUrl }: { logoUrl?: string }) {
	return (
		<header className="sticky top-0 z-50 border-b border-surface-line bg-white/90 backdrop-blur">
			<div className="container-page flex items-center justify-between gap-2 py-4 sm:gap-4 sm:py-6 lg:py-4">
				<Link href="/" className="flex shrink-0 items-center gap-1.5 sm:gap-2">
					<Image
						src={logoUrl || "/images/BS_Unique_Mart_Logo.png"}
						alt="BS Unique Mart"
						width={48}
						height={48}
						className="h-8 w-8 object-contain sm:h-9 sm:w-9 lg:h-8 lg:w-8"
						priority
					/>
					<span className="hidden whitespace-nowrap font-[family-name:var(--font-outfit)] font-bold text-ink sm:inline-block sm:text-xl md:text-2xl lg:text-xl">
						{content.brand.name}
					</span>
				</Link>

				<nav className="hidden items-center gap-4 text-sm font-medium text-ink/70 md:flex md:gap-6 lg:gap-6 lg:text-base">
					{content.nav.map((item) => (
						<a
							key={item.href}
							href={item.href}
							className="transition-colors hover:text-ink"
						>
							{item.label}
						</a>
					))}
				</nav>

				<a
					href="#order"
					className="shrink-0 whitespace-nowrap rounded-none bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark sm:px-6 sm:py-3 sm:text-base lg:px-5 lg:py-2.5 lg:text-sm"
				>
					{content.ctaLabel}
				</a>
			</div>
		</header>
	);
}
