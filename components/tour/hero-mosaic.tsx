import Image from "next/image";

/**
 * The GetYourGuide-style gallery mosaic.
 *
 * One tall lead image beside a 2×2 grid on desktop. On small screens the
 * 2×2 was previously `hidden`, so phones only saw the lead photograph —
 * mobile now shows the first four images in a compact grid.
 */
/** Which grid cells a tile occupies, so the 2×2 is always fully packed. */
function spanClass(index: number, count: number): string {
  if (count === 1) return "col-span-2 row-span-2";
  if (count === 2) return "col-span-2";
  // count 3: first two share the top row, the third fills the bottom.
  if (count === 3 && index === 2) return "col-span-2";
  return "";
}

export function TourHeroMosaic({
  images,
  alt,
  photoCount,
  moreLabel,
}: {
  images: string[];
  alt: string;
  photoCount?: number;
  moreLabel?: string;
}) {
  const [lead, ...rest] = images;
  if (!lead) return null;

  const tiles = rest.slice(0, 4);
  const mobile = images.slice(0, 4);
  const total = photoCount ?? images.length;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl md:hidden">
        {mobile.map((src, i) => (
          <div key={src} className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={src}
              alt={i === 0 ? alt : ""}
              fill
              priority={i === 0}
              sizes="50vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className="relative hidden gap-2 overflow-hidden rounded-2xl md:grid md:grid-cols-2">
        <div className="relative h-[clamp(20rem,42vw,30rem)]">
          <Image
            src={lead}
            alt={alt}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        {tiles.length > 0 ? (
          <div className="grid grid-cols-2 grid-rows-2 gap-2 md:h-[clamp(20rem,42vw,30rem)]">
            {tiles.map((src, i) => (
              <div
                key={src}
                className={[
                  "relative overflow-hidden",
                  spanClass(i, tiles.length),
                ].join(" ")}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition duration-700 hover:scale-105"
                />
                {i === tiles.length - 1 && total > images.length && moreLabel ? (
                  <span className="pointer-events-none absolute inset-0 grid place-items-center bg-hero/45 text-sm font-semibold text-paper">
                    {moreLabel}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
