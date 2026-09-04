import type { MetadataRoute } from "next";
import { LANGS, langPath } from "@/lib/i18n/langs";
import { TOURS } from "@/lib/tours";

const ORIGIN = "https://waytocrete.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/tours", "/about", "/contact", "/partners"];
  const entries: MetadataRoute.Sitemap = [];
  for (const lang of LANGS) {
    for (const path of paths) {
      entries.push({ url: `${ORIGIN}${langPath(lang, path)}`, changeFrequency: "weekly", priority: path === "" ? 1 : 0.8 });
    }
    for (const tour of TOURS) {
      entries.push({ url: `${ORIGIN}${langPath(lang, `/tours/${tour.slug}`)}`, changeFrequency: "weekly", priority: 0.7 });
    }
  }
  return entries;
}
