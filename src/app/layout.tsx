import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Providers } from "@/components/shared/Providers";
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
  title: "Contributor",
  description: "A content publishing platform for writers and readers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
