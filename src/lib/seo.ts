import type { Metadata } from "next";

// Falls back to localhost for local dev; Step 17's deploy sets a real
// production URL for this same env var (already read the same way
// throughout the app, e.g. email templates' dashboard links).
export const SITE_URL = process.env.AUTH_URL ?? "http://localhost:3000";
export const SITE_NAME = "Contributor";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  ogImage?: string | null;
  noIndex?: boolean;
}

// Shared generateMetadata() builder for every public page — sets
// title/description, canonical URL, and Open Graph/Twitter card data
// consistently, per docs/04_MasterBuildGuide.md Step 16.1. ogImage
// defaults to a static site-wide fallback when a page has no cover
// image of its own (e.g. an article with no cover set).
export function buildMetadata({ title, description, path, ogImage, noIndex }: PageMetadataInput): Metadata {
  const url = `${SITE_URL}${path}`;
  const image = ogImage || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
