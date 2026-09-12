"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { motion, AnimatePresence } from "framer-motion";
import { Bold, Italic, Heading2, Heading3, Link as LinkIcon, Quote } from "lucide-react";

interface FloatingToolbarProps {
  editor: Editor;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive: boolean;
  label: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, label, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      className={
        isActive
          ? "flex h-8 w-8 items-center justify-center rounded-[4px] bg-white/15 text-white"
          : "flex h-8 w-8 items-center justify-center rounded-[4px] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      }
    >
      {children}
    </button>
  );
}

// The inline selection toolbar — appears only when text is selected,
// per Step 12's confirmed Medium-style UX. Framer Motion drives the
// fade+scale entrance since Tiptap's BubbleMenu itself only controls
// mount/unmount, not transition.
export function FloatingToolbar({ editor }: FloatingToolbarProps) {
  const [linkPromptOpen, setLinkPromptOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const applyLink = () => {
    const url = linkUrl.trim();
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkPromptOpen(false);
    setLinkUrl("");
  };

  return (
    <BubbleMenu
      editor={editor}
      options={{
        placement: "top",
        offset: 10,
        flip: { padding: { top: 84, bottom: 12, left: 12, right: 12 }, fallbackPlacements: ["bottom"] },
        shift: { padding: 12 },
      }}
      shouldShow={({ state }) => !state.selection.empty && !editor.isActive("image")}
    >
      <AnimatePresence>
        <motion.div
          data-dark-surface
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.12 }}
          className="flex items-center gap-0.5 rounded-full bg-ink px-1.5 py-1.5 shadow-lg"
        >
          {linkPromptOpen ? (
            <div className="flex items-center gap-1.5 px-1">
              <input
                type="text"
                autoFocus
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyLink();
                  }
                  if (e.key === "Escape") setLinkPromptOpen(false);
                }}
                placeholder="Paste a link..."
                className="h-7 w-40 rounded-[3px] border-none bg-white/10 px-2 text-xs text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-white/30"
              />
              <button
                type="button"
                onClick={applyLink}
                className="rounded-[3px] bg-white/15 px-2 py-1 text-xs font-medium text-white hover:bg-white/25"
              >
                Apply
              </button>
            </div>
          ) : (
            <>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                label="Bold"
              >
                <Bold className="h-4 w-4" aria-hidden="true" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                label="Italic"
              >
                <Italic className="h-4 w-4" aria-hidden="true" />
              </ToolbarButton>
              <span className="mx-0.5 h-4 w-px bg-white/20" aria-hidden="true" />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive("heading", { level: 2 })}
                label="Heading 2"
              >
                <Heading2 className="h-4 w-4" aria-hidden="true" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive("heading", { level: 3 })}
                label="Heading 3"
              >
                <Heading3 className="h-4 w-4" aria-hidden="true" />
              </ToolbarButton>
              <span className="mx-0.5 h-4 w-px bg-white/20" aria-hidden="true" />
              <ToolbarButton
                onClick={() => {
                  setLinkUrl(editor.getAttributes("link").href ?? "");
                  setLinkPromptOpen(true);
                }}
                isActive={editor.isActive("link")}
                label="Link"
              >
                <LinkIcon className="h-4 w-4" aria-hidden="true" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")}
                label="Blockquote"
              >
                <Quote className="h-4 w-4" aria-hidden="true" />
              </ToolbarButton>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </BubbleMenu>
  );
}
