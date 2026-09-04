import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LANGS, parseLang, type Lang } from "@/lib/i18n/langs";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = parseLang(raw) as Lang;
  return (
    <div className="min-h-screen bg-bg text-ink">
      <Header lang={lang} restPath="" />
      {children}
      <Footer lang={lang} />
    </div>
  );
}
