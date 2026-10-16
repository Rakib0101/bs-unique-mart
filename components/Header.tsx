import content from "@/data/site.json";
import Image from "next/image";
import Link from "next/link";

export default function Header({ logoUrl }: { logoUrl?: string }) {
	return (
		<header className="sticky top-0 z-50 border-b border-surface-line bg-white/90 backdrop-blur">
			<div className="container-page flex h-16 items-center justify-between gap-4">
				<Link href="/" className="flex shrink-0 items-center gap-2">
					<Image
						src={logoUrl || "/images/BS_Unique_Mart_Logo.png"}
						alt="BS Unique Mart"
						width={48}
						height={48}
						className="h-8 w-8 object-contain sm:h-9 sm:w-9"
						priority
					/>
					<span className="text-base font-bold text-ink sm:text-lg">
						{content.brand.name}
					</span>
				</Link>

				<nav className="hidden items-center gap-8 text-sm font-medium text-ink/70 md:flex">
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
					className="shrink-0 rounded-none bg-brand px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-brand-dark sm:px-8 sm:py-4 sm:text-lg"
				>
					{content.ctaLabel}
				</a>
			</div>
		</header>
	);
}
