"use client";

import { useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { ImageIcon } from "lucide-react";
import { FloatingToolbar } from "./FloatingToolbar";
import { useToast } from "@/hooks/use-toast";

const MAX_INLINE_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB, base64 stub — same approach as the cover image upload

interface EditorCanvasProps {
  title: string;
  onTitleChange: (title: string) => void;
  content: string;
  onContentChange: (html: string) => void;
  onEditorReady?: (editor: Editor) => void;
}

// The large serif reading-width writing surface — minimal chrome, a
// single title input above a Tiptap content area, matching Medium's
// "write a story" editor per docs/04_MasterBuildGuide.md Step 12
// (confirmed against that UX description before building).
export function EditorCanvas({ title, onTitleChange, content, onContentChange, onEditorReady }: EditorCanvasProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showError } = useToast();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, HTMLAttributes: { class: "underline decoration-1 underline-offset-2" } },
      }),
      Image.configure({ HTMLAttributes: { class: "rounded-[4px]" } }),
      Placeholder.configure({ placeholder: "Tell your story..." }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onContentChange(editor.getHTML()),
    onCreate: ({ editor }) => onEditorReady?.(editor),
    editorProps: {
      attributes: {
        class:
          "prose-content min-h-[50vh] text-[1.0625rem] leading-[1.8] text-text-body focus:outline-none [&_h2]:font-serif [&_h2]:text-[1.75rem] [&_h2]:font-semibold [&_h2]:text-text-heading [&_h3]:font-serif [&_h3]:text-[1.375rem] [&_h3]:font-semibold [&_h3]:text-text-heading [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-text-body [&_img]:my-6 [&_img]:w-full [&_p]:mb-4",
      },
    },
  });

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;
    // Both of these previously failed silently — the picker would just
    // close with no image inserted and no indication why, per the
    // "File Upload UI" gap this audit specifically flagged.
    if (!file.type.startsWith("image/")) {
      showError("That file isn't an image. Choose a JPG, PNG, GIF, or WEBP.");
      return;
    }
    if (file.size > MAX_INLINE_IMAGE_BYTES) {
      showError(`That image is too large — inline images must be under ${MAX_INLINE_IMAGE_BYTES / 1024 / 1024}MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result as string }).run();
    };
    reader.onerror = () => showError("Couldn't read that image. Please try again.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="mx-auto max-w-[720px]">
      <textarea
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Article title..."
        rows={1}
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = "auto";
          el.style.height = `${el.scrollHeight}px`;
        }}
        className="mb-4 w-full resize-none overflow-hidden border-none bg-transparent font-serif text-4xl font-semibold leading-[1.2] text-text-heading placeholder:text-text-muted/60 focus:outline-none"
      />
      {editor && <FloatingToolbar editor={editor} />}
      <EditorContent editor={editor} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImagePick}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="mt-4 flex items-center gap-2 rounded-[4px] border border-dashed border-border-strong px-4 py-2.5 text-sm text-text-muted transition-colors hover:border-ink hover:text-text-body"
      >
        <ImageIcon className="h-4 w-4" aria-hidden="true" />
        Add image
      </button>
    </div>
  );
}
