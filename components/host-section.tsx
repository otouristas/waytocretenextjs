import Image from "next/image";
import type { Lang } from "@/lib/i18n/langs";
import { HOST_IMAGES, hostCopy } from "@/lib/i18n/host";

/**
 * Meet the host.
 *
 * The About page's one human moment, so it is laid out as an editorial spread
 * rather than another card: a tall frame that runs alongside the opening
 * paragraphs, then the prose widening to full measure, then two landscapes
 * closing the section. That shape gives the reader a face-height image at the
 * point they start reading and a place to rest at the point they finish.
 *
 * It replaced a single pull-quote. Everything the quote said — that a day
 * here feels like being shown around by someone who lives on the island — the
 * prose now says at length and in the host's own terms.
 */
export function HostSection({ lang }: { lang: Lang }) {
  const copy = hostCopy(lang);
  const [lead, ...rest] = HOST_IMAGES;
  const [first, ...tail] = copy.paragraphs;

  return (
    <section className="mt-14 scroll-mt-28" aria-labelledby="host-heading">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
        {copy.eyebrow}
      </p>
      <h2
        id="host-heading"
        className="mt-2 font-display text-2xl leading-snug text-ink sm:text-3xl"
      >
        {copy.title}
      </h2>

      <div className="mt-6 gap-6 sm:grid sm:grid-cols-[minmax(0,15rem)_1fr] sm:items-start">
        <figure className="relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-line">
          <Image
            src={lead.src}
            alt={lead.alt}
            fill
            sizes="(min-width: 640px) 15rem, 100vw"
            className="object-cover"
          />
        </figure>

        <div className="mt-6 sm:mt-0">
          <p className="text-lg leading-relaxed text-ink">{first}</p>
          {tail.slice(0, 1).map((para) => (
            <p key={para} className="mt-4 leading-relaxed text-muted">
              {para}
            </p>
          ))}
        </div>
      </div>

      {/* The remaining paragraphs run to full measure — a narrow column beside
          a picture is fine for two, tiring for four. */}
      {tail.slice(1).map((para) => (
        <p key={para} className="mt-4 leading-relaxed text-muted">
          {para}
        </p>
      ))}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {rest.map((image) => (
          <figure
            key={image.src}
            className="relative aspect-[3/2] overflow-hidden rounded-2xl ring-1 ring-line"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 640px) 45vw, 100vw"
              className="object-cover"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
