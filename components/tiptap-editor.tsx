"use client";

import type React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { createLowlight, common } from "lowlight";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AIAutocomplete } from "@/components/ai-autocomplete";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  TableIcon,
  ImageIcon,
  LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  UnderlineIcon,
  SubscriptIcon,
  SuperscriptIcon,
  CheckSquare,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Table } from "@tiptap/extension-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const lowlight = createLowlight(common);

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  noteId: string;
}

export function TipTapEditor({ content, onChange, noteId }: TipTapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompletePosition, setAutocompletePosition] = useState({
    x: 0,
    y: 0,
  });
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      // Check for AI autocomplete trigger
      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - 10),
        from
      );

      if (textBefore.endsWith("//ai") || textBefore.endsWith("//help")) {
        const coords = editor.view.coordsAtPos(from);
        setAutocompletePosition({ x: coords.left, y: coords.bottom });
        setShowAutocomplete(true);
      } else {
        setShowAutocomplete(false);
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none p-6 h-full overflow-y-auto cursor-text first:cursor-text [&_*]:cursor-default selection:cursor-text",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, noteId, editor]);

  const decodeEscapedQuotes = (html: string): string => {
    return html.replace(/\\"/g, '"');
  };

  if (!editor) {
    return null;
  }

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;

      editor.chain().focus().setImage({ src: base64, alt: file.name }).run();
      toast({ title: "Image added", description: "Stored locally in note." });
    };
    reader.readAsDataURL(file);
  };

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleAutocompleteSelect = (suggestion: string) => {
    const { from } = editor.state.selection;
    const textBefore = editor.state.doc.textBetween(
      Math.max(0, from - 10),
      from
    );

    let triggerLength = 0;
    if (textBefore.endsWith("//ai")) triggerLength = 4;
    else if (textBefore.endsWith("//help")) triggerLength = 6;

    editor
      .chain()
      .focus()
      .deleteRange({ from: from - triggerLength, to: from })
      .insertContent(suggestion)
      .run();

    setShowAutocomplete(false);
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Toolbar */}
      <div className="border-b p-3 flex flex-wrap items-center gap-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Text Formatting */}
        <Button
          variant={editor.isActive("bold") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive("italic") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive("underline") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive("strike") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive("highlight") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive("code") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Headings */}
        <Button
          variant={
            editor.isActive("heading", { level: 1 }) ? "default" : "ghost"
          }
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          variant={
            editor.isActive("heading", { level: 2 }) ? "default" : "ghost"
          }
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          variant={
            editor.isActive("heading", { level: 3 }) ? "default" : "ghost"
          }
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <Button
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive("taskList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          <CheckSquare className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive("blockquote") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Alignment */}
        <Button
          variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          variant={
            editor.isActive({ textAlign: "center" }) ? "default" : "ghost"
          }
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          variant={
            editor.isActive({ textAlign: "right" }) ? "default" : "ghost"
          }
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Script */}
        <Button
          variant={editor.isActive("subscript") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        >
          <SubscriptIcon className="w-4 h-4" />
        </Button>
        <Button
          variant={editor.isActive("superscript") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        >
          <SuperscriptIcon className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Media & Links */}
        <Button variant="ghost" size="sm" onClick={addImage}>
          <ImageIcon className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={addLink}>
          <LinkIcon className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={addTable}>
          <TableIcon className="w-4 h-4" />
        </Button>

        {/* Table Tools Dropdown – visible only if inside a table */}
        {editor.isActive("table") && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52">
              <DropdownMenuLabel>Table Tools</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addColumnBefore().run()}
              >
                Add Column Before
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addColumnAfter().run()}
              >
                Add Column After
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteColumn().run()}
              >
                Delete Column
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addRowBefore().run()}
              >
                Add Row Before
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addRowAfter().run()}
              >
                Add Row After
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteRow().run()}
              >
                Delete Row
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteTable().run()}
              >
                Delete Table
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().mergeCells().run()}
              >
                Merge Cells
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().splitCell().run()}
              >
                Split Cell
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeaderColumn().run()
                }
              >
                Toggle Header Column
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleHeaderRow().run()}
              >
                Toggle Header Row
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleHeaderCell().run()}
              >
                Toggle Header Cell
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().mergeOrSplit().run()}
              >
                Merge / Split
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().fixTables().run()}
              >
                Fix Tables
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().goToNextCell().run()}
              >
                Go to Next Cell
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().goToPreviousCell().run()}
              >
                Go to Previous Cell
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="w-4 h-4" />
        </Button>

        <div className="ml-auto text-xs text-muted-foreground">
          Type <code>//ai</code> or <code>//help</code> for AI suggestions
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <EditorContent editor={editor} className="h-full" />
      </div>

      {/* AI Autocomplete */}
      {showAutocomplete && (
        <AIAutocomplete
          position={autocompletePosition}
          onSelect={handleAutocompleteSelect}
          onClose={() => setShowAutocomplete(false)}
          context={content}
        />
      )}

      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
