"use client";

import type { JSONContent } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { debounce } from "@/lib/utils";

interface NoteEditorProps {
  content: JSONContent;
  onChange: (content: JSONContent) => void;
  onTitleChange?: (title: string) => void;
  title?: string;
  editable?: boolean;
}

export function NoteEditor({
  content,
  onChange,
  onTitleChange,
  title = "Untitled Note",
  editable = true,
}: NoteEditorProps) {
  const debouncedOnChange = useCallback(
    debounce((json: JSONContent) => {
      onChange(json);
    }, 500),
    [onChange],
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your note...",
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor: ed }) => {
      debouncedOnChange(ed.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose dark:prose-invert max-w-none min-h-[300px] focus:outline-none px-1",
      },
    },
  });

  useEffect(() => {
    if (editor && content) {
      const current = JSON.stringify(editor.getJSON());
      const incoming = JSON.stringify(content);
      if (current !== incoming) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange?.(e.target.value)}
        disabled={!editable}
        className="w-full border-none bg-transparent text-2xl font-bold focus:outline-none focus:ring-0"
        placeholder="Note title"
      />

      {editable && (
        <div className="flex gap-1 border-b pb-2">
          <Button
            type="button"
            variant={editor.isActive("bold") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("italic") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
