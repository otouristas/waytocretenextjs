import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://waytocrete.com"),
  title: "Way to Crete | Private tours from Rethymno",
  description: "Private Crete tours, transfers and B2B DMC services from Rethymno.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
