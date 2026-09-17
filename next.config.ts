import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lucide-react is imported piecemeal (one icon at a time) in dozens
  // of components across the app — without this, Next can still end up
  // pulling in more of the package's module graph than a given page
  // actually uses. framer-motion ships many rarely-used named exports
  // per file too. Both are on Next's own list of packages this
  // optimization is designed for.
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    serverActions: {
      // Articles/Publications store images as base64 data URLs directly
      // in the request body (no external file storage — see the
      // MAX_COVER_IMAGE_BYTES/MAX_INLINE_IMAGE_BYTES comments in
      // ArticleForm.tsx/EditorCanvas.tsx/PublicationForm.tsx), and an
      // article can have a 2MB cover image plus multiple inline images
      // up to 4MB each. Base64 also inflates raw byte size by ~33%.
      // Next's default 1MB Server Action body limit is far below even a
      // single realistic article, and was silently failing every
      // createArticleAction/updateArticleAction call with an image
      // (HTTP 413, Body exceeded 1 MB limit) with no error surfaced to
      // the user at all — the Publish button just stayed on
      // "Publishing..." and reset. 15MB covers a cover image plus
      // several inline images with real headroom.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
