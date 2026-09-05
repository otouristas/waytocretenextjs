import { Marked, type Tokens } from "marked";
import { headingId } from "@/lib/content/format";

/**
 * Long-form body copy.
 *
 * Guide and place bodies are authored as Markdown in our own content files —
 * never user input — so rendering the parsed HTML directly is safe here, and
 * it keeps tables, which are the single most valuable element on a
 * comparison page and the thing answer engines lift most readily.
 *
 * Styling is applied with descendant selectors rather than a typography
 * plugin so the brand's own scale and colours apply without a second system
 * to reconcile.
 *
 * `anchors` stamps an `id` on every h2 and h3 so a long document — the terms,
 * the privacy policy — can carry a contents rail and be deep-linked to a
 * single clause. It is opt-in because most pages have no use for it and an
 * unused id on every heading is just noise in the markup.
 */

/**
 * marked no longer generates heading ids of its own, so the anchored variant
 * gets its own instance rather than mutating the shared parser — `marked.use`
 * is global and would silently start stamping ids on guide and place bodies
 * too.
 */
const anchored = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    heading(token: Tokens.Heading) {
      const content = this.parser.parseInline(token.tokens);
      if (token.depth !== 2 && token.depth !== 3) {
        return `<h${token.depth}>${content}</h${token.depth}>`;
      }
      return `<h${token.depth} id="${headingId(token.text)}">${content}</h${token.depth}>`;
    },
  },
});

const plain = new Marked({ gfm: true, breaks: false });

export function Prose({ markdown, anchors = false }: { markdown: string; anchors?: boolean }) {
  const html = (anchors ? anchored : plain).parse(markdown, { async: false }) as string;

  return (
    <div
      className={[
        "max-w-none text-[15px] leading-relaxed text-muted",
        "[&_h2]:mt-10 [&_h2]:scroll-mt-28 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink",
        "[&_h3]:mt-7 [&_h3]:scroll-mt-28 [&_h3]:font-display [&_h3]:text-lg [&_h3]:text-ink",
        "[&_p]:mt-4",
        "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
        "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5",
        "[&_strong]:font-semibold [&_strong]:text-ink",
        "[&_a]:font-medium [&_a]:text-accent [&_a]:underline",
        "[&_blockquote]:mt-5 [&_blockquote]:border-l-2 [&_blockquote]:border-olive [&_blockquote]:pl-4 [&_blockquote]:italic",
        // Wide tables scroll inside their own box; the page never scrolls sideways.
        "[&_table]:mt-6 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_table]:text-sm",
        "[&_th]:border-b [&_th]:border-line [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-ink [&_th]:whitespace-nowrap",
        "[&_td]:border-b [&_td]:border-line [&_td]:px-3 [&_td]:py-2.5 [&_td]:align-top",
        "[&_tbody_tr:hover]:bg-surface",
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * The hard-facts block.
 *
 * A definition list of concrete values — distances, drive times, entry fees,
 * open months. This is the highest-value markup on an answer page: it is
 * unambiguous to a reader skimming and to a model extracting.
 */
export function QuickAnswers({
  items,
  title = "At a glance",
}: {
  items: Array<{ term: string; value: string }>;
  title?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8 rounded-2xl bg-surface p-5 ring-1 ring-line">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">{title}</h2>
      <dl className="mt-3 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.term} className="flex justify-between gap-4 border-b border-line pb-2">
            <dt className="text-sm text-faint">{item.term}</dt>
            <dd className="text-right text-sm font-semibold text-ink">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
