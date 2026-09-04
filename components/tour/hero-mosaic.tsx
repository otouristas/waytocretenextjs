import Image from "next/image";

/**
 * The GetYourGuide-style gallery mosaic.
 *
 * One tall lead image beside a 2×2 grid, on a fixed aspect ratio. This
 * replaces a single `h-[46vh]` banner, which cropped landscape photographs
 * unpredictably — on the Samaria page it cut the group off at the knees and
 * filled the rest of the frame with empty sky.
 *
 * A server component: images and links only, no interactivity. The aspect
 * ratio is fixed in CSS so the block reserves its space before the images
 * load and contributes nothing to CLS.
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
  const total = photoCount ?? images.length;

  return (
    <div className="relative grid gap-2 overflow-hidden rounded-2xl md:grid-cols-2">
      <div className="relative aspect-[4/3] md:aspect-auto md:h-[clamp(20rem,42vw,30rem)]">
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
        <div className="hidden grid-cols-2 grid-rows-2 gap-2 md:grid md:h-[clamp(20rem,42vw,30rem)]">
          {tiles.map((src, i) => (
            <div
              key={src}
              className={[
                "relative overflow-hidden",
                // Galleries are not always four deep. Rather than leave a hole
                // in the 2×2, the last tile widens to fill the row when the
                // count is odd, and a lone pair stacks full-width.
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
                <span className="pointer-events-none absolute inset-0 grid place-items-center bg-hero/45 text-sm font-semibold text-surface">
                  {moreLabel}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
