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
import { FontSize, TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";

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
  Type,
  Palette,
  PaintBucket,
  Search,
  Replace,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const lowlight = createLowlight(common);

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  noteId: string;
}

// Tooltip wrapper component for cleaner code
const TooltipButton = ({
  tooltip,
  children,
  ...props
}: {
  tooltip: string;
  children: React.ReactNode;
  [key: string]: any;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button {...props}>{children}</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

export function TipTapEditor({ content, onChange, noteId }: TipTapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompletePosition, setAutocompletePosition] = useState({
    x: 0,
    y: 0,
  });
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState(0);

  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontFamily.configure({
        types: ["textStyle"],
      }),
      FontSize,
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
        inline: false,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
        allowBase64: true,
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;

      // Insert image as Base64 directly into editor
      editor.chain().focus().setImage({ src: base64, alt: file.name }).run();

      toast({
        title: "Image added",
        description: "This image is stored locally in your note.",
      });
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

 

  // Count matches
  const performFind = () => {
    if (!editor || !findText.trim()) return;

    const regex = new RegExp(findText, "gi");
    const matches = editor.getText().match(regex);
    setMatchCount(matches ? matches.length : 0);

    if (matches && matches.length > 0) {
      // Move selection to first match
      const html = editor.getHTML();
      const idx = html.toLowerCase().indexOf(findText.toLowerCase());
      if (idx >= 0) {
        editor.commands.setTextSelection({
          from: idx + 1,
          to: idx + findText.length,
        });
      }
    }
  };

  // Replace all occurrences
  const performReplaceAll = () => {
    if (!editor || !findText.trim()) return;

    const html = editor.getHTML();
    const regex = new RegExp(findText, "gi");
    const newHtml = html.replace(regex, replaceText);
    editor.commands.setContent(newHtml);

    setMatchCount(0);
  };

  // Replace first occurrence after cursor
  const performReplace = () => {
    if (!editor || !findText.trim()) return;

    const html = editor.getHTML();
    const regex = new RegExp(findText, "i");
    const newHtml = html.replace(regex, replaceText);
    editor.commands.setContent(newHtml);

    performFind(); // update match count
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col relative">
        {/* Toolbar */}
        <div className="border-b p-3 flex flex-wrap items-center gap-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <TooltipButton
              tooltip="Bold (Ctrl+B)"
              variant={editor.isActive("bold") ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="w-4 h-4" />
            </TooltipButton>

            <TooltipButton
              tooltip="Italic (Ctrl+I)"
              variant={editor.isActive("italic") ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="w-4 h-4" />
            </TooltipButton>

            <TooltipButton
              tooltip="Underline (Ctrl+U)"
              variant={editor.isActive("underline") ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="w-4 h-4" />
            </TooltipButton>

            <TooltipButton
              tooltip="Strikethrough"
              variant={editor.isActive("strike") ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="w-4 h-4" />
            </TooltipButton>

            <TooltipButton
              tooltip="Highlight"
              variant={editor.isActive("highlight") ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
            >
              <Highlighter className="w-4 h-4" />
            </TooltipButton>

            <TooltipButton
              tooltip="Inline Code"
              variant={editor.isActive("code") ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <Code className="w-4 h-4" />
            </TooltipButton>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Font Controls */}
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Type className="w-4 h-4" />
                      <span className="text-xs">Font</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Font Family</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent>
                {[
                  "Arial",
                  "Georgia",
                  "Courier New",
                  "Times New Roman",
                  "Helvetica",
                  "Verdana",
                ].map((font) => (
                  <DropdownMenuItem
                    key={font}
                    onClick={() =>
                      editor.chain().focus().setFontFamily(font).run()
                    }
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Font Size */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <span className="text-xs font-mono">14</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Font Size</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent>
                {[
                  "10px",
                  "12px",
                  "14px",
                  "16px",
                  "18px",
                  "20px",
                  "24px",
                  "28px",
                  "32px",
                ].map((size) => (
                  <DropdownMenuItem
                    key={size}
                    onClick={() =>
                      editor.chain().focus().setFontSize(size).run()
                    }
                  >
                    {size}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Text Color */}
            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 relative">
                    <Palette className="w-4 h-4" />
                    <input
                      type="color"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) =>
                        editor.chain().focus().setColor(e.target.value).run()
                      }
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Text Color</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Background Color */}
            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 relative">
                    <PaintBucket className="w-4 h-4" />
                    <input
                      type="color"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) =>
                        editor
                          .chain()
                          .focus()
                          .toggleHighlight({ color: e.target.value })
                          .run()
                      }
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Background Color</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Headings */}
          <div className="flex items-center gap-1">
            <TooltipButton
              tooltip="Heading 1"
              variant={
                editor.isActive("heading", { level: 1 }) ? "default" : "ghost"
              }
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
            >
              <Heading1 className="w-4 h-4" />
            </TooltipButton>

            <TooltipButton
              tooltip="Heading 2"
              variant={
                editor.isActive("heading", { level: 2 }) ? "default" : "ghost"
              }
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            >
              <Heading2 className="w-4 h-4" />
            </TooltipButton>

            <TooltipButton
              tooltip="Heading 3"
              variant={
                editor.isActive("heading", { level: 3 }) ? "default" : "ghost"
              }
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
            >
              <Heading3 className="w-4 h-4" />
            </TooltipButton>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <TooltipButton
              tooltip="Bullet List"
              variant={editor.isActive("bulletList") ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="w-4 h-4" />
            </TooltipButton>

            <TooltipButton
              tooltip="Numbered List"
              variant={editor.isActive("orderedList") ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="w-4 h-4" />
            </TooltipButton>

            <TooltipButton
              tooltip="Task List"
              variant={editor.isActive("taskList") ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleTaskList().run()}
            >
              <CheckSquare className="w-4 h-4" />
            </TooltipButton>

            <TooltipButton
              tooltip="Quote"
              variant={editor.isActive("blockquote") ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="w-4 h-4" />
            </TooltipButton>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <TooltipButton
              tooltip="Align Left"
              variant={
                editor.isActive({ textAlign: "left" }) ? "default" : "ghost"
              }
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft className="w-4 h-4" />
            </TooltipButton>

            <TooltipButton
              tooltip="Align Center"
              variant={
                editor.isActive({ textAlign: "center" }) ? "default" : "ghost"
              }
              size="sm"
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
            >
              <AlignCenter className="w-4 h-4" />
            </TooltipButton>

            <TooltipButton
              tooltip="Align Right"
              variant={
                editor.isActive({ textAlign: "right" }) ? "default" : "ghost"
              }
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
              <AlignRight className="w-4 h-4" />
            </TooltipButton>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Script */}
          <div className="flex items-center gap-1">
            <TooltipButton
              tooltip="Subscript"
              variant={editor.isActive("subscript") ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleSubscript().run()}
            >
              <SubscriptIcon className="w-4 h-4" />
            </TooltipButton>

            <TooltipButton
              tooltip="Superscript"
              variant={editor.isActive("superscript") ? "default" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
            >
              <SuperscriptIcon className="w-4 h-4" />
            </TooltipButton>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Media & Links */}
          <div className="flex items-center gap-1">
            <TooltipButton
              tooltip="Insert Image"
              variant="ghost"
              size="sm"
              onClick={addImage}
            >
              <ImageIcon className="w-4 h-4" />
            </TooltipButton>

            <TooltipButton
              tooltip="Insert Link"
              variant="ghost"
              size="sm"
              onClick={addLink}
            >
              <LinkIcon className="w-4 h-4" />
            </TooltipButton>

            <TooltipButton
              tooltip="Insert Table"
              variant="ghost"
              size="sm"
              onClick={addTable}
            >
              <TableIcon className="w-4 h-4" />
            </TooltipButton>
          </div>

          {/* Table Tools Dropdown – visible only if inside a table */}
          {editor.isActive("table") && (
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Table Tools</p>
                </TooltipContent>
              </Tooltip>
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
                  onClick={() =>
                    editor.chain().focus().toggleHeaderCell().run()
                  }
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
                  onClick={() =>
                    editor.chain().focus().goToPreviousCell().run()
                  }
                >
                  Go to Previous Cell
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Find & Replace */}
          <TooltipButton
            tooltip="Find & Replace"
            variant="ghost"
            size="sm"
            onClick={() => setShowFindReplace(true)}
          >
            <Search className="w-4 h-4" />
          </TooltipButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <TooltipButton
              tooltip="Undo (Ctrl+Z)"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="w-4 h-4" />
            </TooltipButton>

            <TooltipButton
              tooltip="Redo (Ctrl+Y)"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="w-4 h-4" />
            </TooltipButton>
          </div>

          <div className="ml-auto text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            Type{" "}
            <code className="bg-background px-1 py-0.5 rounded text-xs">
              //ai
            </code>{" "}
            or{" "}
            <code className="bg-background px-1 py-0.5 rounded text-xs">
              //help
            </code>{" "}
            for AI suggestions
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

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Find & Replace Modal */}
        <Dialog open={showFindReplace} onOpenChange={setShowFindReplace}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Find & Replace</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="find-input">Find</Label>
                <Input
                  id="find-input"
                  placeholder="Enter text to find..."
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") performFind();
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="replace-input">Replace with</Label>
                <Input
                  id="replace-input"
                  placeholder="Enter replacement text..."
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") performReplace();
                  }}
                />
              </div>

              {matchCount > 0 && (
                <div className="text-sm text-muted-foreground">
                  Found {matchCount} matches
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={performFind}
                disabled={!findText.trim()}
              >
                Find All
              </Button>
              <Button
                variant="outline"
                onClick={performReplace}
                disabled={!findText.trim()}
              >
                Replace
              </Button>
              <Button onClick={performReplaceAll} disabled={!findText.trim()}>
                Replace All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
