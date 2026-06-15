"use client";

import {
  AtSign,
  Bold,
  ChevronDown,
  Code,
  CodeXml,
  Italic,
  Link,
  List,
  ListOrdered,
  Loader2,
  Mic,
  PenLine,
  Plus,
  Send,
  Smile,
  Strikethrough,
  TextQuote,
  Type,
  Video,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  insertAtCursor,
  insertCodeBlock,
  insertLinePrefix,
  insertLink,
  wrapSelection,
  type FormatResult,
} from "@/lib/chat/markdown-format";
import { cn } from "@/lib/utils";

const EMOJI_PICKER = [
  "😀", "😂", "😍", "🥳", "👍", "👎", "❤️", "🔥", "✨", "🎉",
  "🚀", "💯", "👀", "🙌", "😢", "😮", "🤔", "👏", "✅", "❌",
];

type MessageInputProps = {
  onSend: (content: string) => Promise<void>;
  onAlsoSendToChannel?: (content: string) => Promise<void>;
  channelName?: string;
  isThread?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

type ToolbarButtonProps = {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
};

function ToolbarButton({ label, onClick, children, active }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-lg text-gray-400 transition-smooth hover:bg-white/10 hover:text-white",
        active && "bg-white/10 text-white",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-0.5 h-5 w-px bg-white/10" />;
}

export function MessageInput({
  onSend,
  onAlsoSendToChannel,
  channelName,
  isThread = false,
  placeholder = "Message…",
  disabled,
  className,
}: MessageInputProps) {
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showFormatting, setShowFormatting] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [alsoSendToChannel, setAlsoSendToChannel] = useState(false);

  const applyFormat = useCallback((result: FormatResult) => {
    setContent(result.value);
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }, []);

  const withTextarea = useCallback(
    (fn: (textarea: HTMLTextAreaElement) => FormatResult) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      applyFormat(fn(textarea));
    },
    [applyFormat],
  );

  const insertEmoji = (emoji: string) => {
    withTextarea((textarea) => insertAtCursor(textarea, emoji));
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSend(trimmed);
      if (isThread && alsoSendToChannel && onAlsoSendToChannel) {
        await onAlsoSendToChannel(trimmed);
      }
      setContent("");
      setAlsoSendToChannel(false);
      setShowEmojiPicker(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const showComingSoon = (feature: string) => {
    toast({
      title: "Coming soon",
      description: `${feature} will be available in a future update.`,
    });
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={cn(
        "relative shrink-0 border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4",
        className,
      )}
    >
      <div className="liquid-glass overflow-hidden rounded-xl">
        {showFormatting && (
          <div className="flex flex-wrap items-center gap-0.5 border-b border-white/10 px-2 py-1.5">
            <ToolbarButton label="Bold" onClick={() => withTextarea((t) => wrapSelection(t, "**"))}>
              <Bold className="size-4" />
            </ToolbarButton>
            <ToolbarButton label="Italic" onClick={() => withTextarea((t) => wrapSelection(t, "_"))}>
              <Italic className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Strikethrough"
              onClick={() => withTextarea((t) => wrapSelection(t, "~~"))}
            >
              <Strikethrough className="size-4" />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton label="Link" onClick={() => withTextarea(insertLink)}>
              <Link className="size-4" />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton
              label="Numbered list"
              onClick={() => withTextarea((t) => insertLinePrefix(t, "1. "))}
            >
              <ListOrdered className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Bulleted list"
              onClick={() => withTextarea((t) => insertLinePrefix(t, "- "))}
            >
              <List className="size-4" />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton
              label="Blockquote"
              onClick={() => withTextarea((t) => insertLinePrefix(t, "> "))}
            >
              <TextQuote className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Code block"
              onClick={() => withTextarea(insertCodeBlock)}
            >
              <CodeXml className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Inline code"
              onClick={() => withTextarea((t) => wrapSelection(t, "`"))}
            >
              <Code className="size-4" />
            </ToolbarButton>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
          placeholder={placeholder}
          rows={2}
          className="max-h-40 min-h-[4.5rem] w-full resize-none border-0 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-0"
        />

        {isThread && channelName && onAlsoSendToChannel && (
          <label className="flex cursor-pointer items-center gap-2 border-t border-white/10 px-3 py-2 text-xs text-gray-400">
            <input
              type="checkbox"
              checked={alsoSendToChannel}
              onChange={(e) => setAlsoSendToChannel(e.target.checked)}
              className="size-3.5 rounded border-white/20 bg-white/5 accent-white"
            />
            <span>
              Also send to <span className="text-gray-300">#{channelName}</span>
            </span>
          </label>
        )}

        <div className="flex items-center justify-between border-t border-white/10 px-2 py-1.5">
          <div className="relative flex items-center gap-0.5">
            <ToolbarButton
              label="Add attachment"
              onClick={() => showComingSoon("File attachments")}
            >
              <Plus className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Toggle formatting"
              active={showFormatting}
              onClick={() => setShowFormatting((v) => !v)}
            >
              <Type className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Emoji"
              active={showEmojiPicker}
              onClick={() => setShowEmojiPicker((v) => !v)}
            >
              <Smile className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Mention someone"
              onClick={() => withTextarea((t) => insertAtCursor(t, "@"))}
            >
              <AtSign className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Record video clip"
              onClick={() => showComingSoon("Video clips")}
            >
              <Video className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Record audio clip"
              onClick={() => showComingSoon("Audio clips")}
            >
              <Mic className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Create a post"
              onClick={() => showComingSoon("Posts")}
            >
              <PenLine className="size-4" />
            </ToolbarButton>

            {showEmojiPicker && (
              <div className="glass-card absolute bottom-full left-0 z-20 mb-2 grid w-56 grid-cols-5 gap-0.5 p-2 sm:w-64">
                {EMOJI_PICKER.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="rounded-lg p-1.5 text-lg transition-smooth hover:bg-white/10"
                    onClick={() => insertEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center overflow-hidden rounded-lg">
            <Button
              type="submit"
              size="icon"
              className="btn-brand size-8 rounded-none"
              disabled={disabled || isSending || !content.trim()}
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
            <Button
              type="button"
              size="icon"
              className="btn-brand size-8 rounded-none border-l border-black/15 hover:bg-gray-100"
              disabled={disabled || isSending || !content.trim()}
              onClick={() => void handleSubmit()}
              title="Send message"
            >
              <ChevronDown className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
