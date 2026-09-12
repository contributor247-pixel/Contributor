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
  const popularPills = await getPopularCategoryPills(5);

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
