"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });

export function JsonModal() {
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [parsedJson, setParsedJson] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ---- Toolbar Actions ----
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonText(text);
    } catch {
      setError("Clipboard paste failed");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
    } catch {
      setError("Clipboard copy failed");
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2)); // beautify
      setError(null);
    } catch (e: any) {
      setError("Invalid JSON: " + e.message);
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed)); // no spaces
      setError(null);
    } catch (e: any) {
      setError("Invalid JSON: " + e.message);
    }
  };

  const handleClear = () => {
    setJsonText("");
    setParsedJson(null);
    setError(null);
  };

  const handleLoad = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setParsedJson(parsed);
      setError(null);
    } catch (e: any) {
      setError("Invalid JSON: " + e.message);
    }
  };
  const handleJsonChange = (value: string) => {
    setJsonText(value);
    try {
      const parsed = JSON.parse(value);
      setParsedJson(parsed);
      setError(null);
    } catch {
      setParsedJson(null);
      setError(null); // don’t block viewer if still typing
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Open JSON Tools
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>JSON Tools</DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex gap-2 border-b pb-2 mb-2">
          <Button size="sm" onClick={handlePaste}>
            Paste
          </Button>
          <Button size="sm" onClick={handleCopy}>
            Copy
          </Button>
          <Button size="sm" onClick={handleFormat}>
            Format
          </Button>
          <Button size="sm" onClick={handleMinify}>
            Remove White Space
          </Button>
          <Button size="sm" onClick={handleClear}>
            Clear
          </Button>
          <Button size="sm" onClick={handleLoad}>
            Load JSON Data
          </Button>
        </div>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {/* Tabs */}
        <Tabs
          defaultValue="text"
          className="flex-1 flex flex-col overflow-hidden"
          onValueChange={(val) => {
            if (val === "viewer") {
              try {
                const parsed = JSON.parse(jsonText);
                setParsedJson(parsed);
                setError(null);
              } catch (e: any) {
                setError("Invalid JSON: " + e.message);
              }
            }
          }}
        >
          <TabsList>
            <TabsTrigger value="text">Text (JSON)</TabsTrigger>
            <TabsTrigger value="viewer">Viewer</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="flex-1 mt-2">
            <Textarea
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="w-full h-full font-mono text-sm"
              placeholder="Paste or type JSON here..."
            />
          </TabsContent>

          <TabsContent
            value="viewer"
            className="flex-1 mt-2 overflow-auto border rounded p-2 bg-muted"
          >
            {parsedJson ? (
              <ReactJson
                src={parsedJson}
                name={false}
                collapsed={2}
                displayDataTypes={false}
                enableClipboard
                theme="monokai"
              />
            ) : (
              <p className="text-muted-foreground text-sm">
                No JSON loaded yet
              </p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
