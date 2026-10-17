/* eslint-disable @next/next/no-img-element */

type Partner = "crete" | null;

const partners = {
  crete: { name: "Discover Crete", url: "https://discover-crete.com/", logo: "/images/brand/credits/discover-crete.png" },
};

// Footer credits shared across AnotherSEOGuru sites: designer, platform and regional partner.
// The logos have light lettering, so this row always sits on a dark background.
export function CreditsBar({ partner, source, className = "" }: { partner: Partner; source: string; className?: string }) {
  const p = partner ? partners[partner] : null;
  const utm = `utm_source=${source}&utm_medium=referral&utm_campaign=partner_footer`;
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-white/55 sm:justify-end ${className}`}
    >
      <a href="https://anotherseoguru.com" target="_blank" rel="noopener" className="inline-flex items-center gap-2 transition-colors hover:text-white">
        <span>Designed by</span>
        <img src="/images/brand/credits/anotherseoguru.svg" alt="AnotherSEOGuru" width={106} height={24} className="h-6 w-auto" loading="lazy" />
      </a>
      <a href="https://touristas.ai" target="_blank" rel="noopener" className="inline-flex items-center gap-2 transition-colors hover:text-white">
        <span>Powered by</span>
        <img src="/images/brand/credits/touristas-ai-white.png" alt="Touristas AI" width={92} height={19} className="h-[19px] w-auto" loading="lazy" />
      </a>
      {p && (
        <a href={`${p.url}?${utm}`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 transition-opacity hover:opacity-90">
          <img src={p.logo} alt="" width={24} height={24} className="h-6 w-6 rounded-full bg-white" loading="lazy" />
          <span className="font-semibold text-white">{p.name}</span>
          <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/60">Partner</span>
        </a>
      )}
    </div>
  );
}
