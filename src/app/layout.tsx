import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Providers } from "@/components/shared/Providers";
import { getPopularCategoryPills } from "@/lib/queries/articles";
import "./globals.css";

// Fraunces (display/serif) + Inter (body/sans), per
// docs/02_ThemeGuideline.md Section 3's confirmed font pairing.
const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Contributor",
    template: "%s | Contributor",
  },
  description: "A content publishing platform for writers and readers.",
  metadataBase: new URL(process.env.AUTH_URL ?? "http://localhost:3000"),
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Every single page on the site renders through this layout, so an
  // unguarded failure here (e.g. a transient Neon connectivity blip —
  // observed directly during QA, see docs/01_ApplicationFlow.md's
  // walkthrough) 500s the entire app, not just whichever page actually
  // needed this data. The popular-categories strip is a non-essential
  // navigation aid, not core content, so degrade to showing none rather
  // than take the whole site down over it.
  const popularPills = await getPopularCategoryPills(5).catch((err) => {
    console.error("Failed to load popular category pills:", err);
    return [];
  });

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers popularPills={popularPills}>{children}</Providers>
      </body>
    </html>
  );
}
