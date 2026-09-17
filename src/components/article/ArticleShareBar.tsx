"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { SocialIcon } from "@/components/shared/SocialIcon";

interface ArticleShareBarProps {
  title: string;
  url?: string;
}

export function ArticleShareBar({ title }: ArticleShareBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTwitterShare = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`;
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="mr-1 hidden text-[11px] font-semibold uppercase tracking-wider text-text-muted sm:inline">
        Share:
      </span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy link to story"
        className="inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-border/80 bg-surface px-3 text-xs font-medium text-text-muted transition-colors hover:border-primary/50 hover:bg-bg-muted hover:text-primary"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-success" />
            <span className="text-success font-semibold">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Copy link</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleTwitterShare}
        aria-label="Share on X / Twitter"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-surface text-text-muted transition-colors hover:border-primary/50 hover:bg-bg-muted hover:text-primary"
      >
        <SocialIcon name="twitter" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
