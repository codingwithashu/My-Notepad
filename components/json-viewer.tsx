"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Lazy-load react-json-view for tree rendering
const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });

export function JsonViewer() {
  const [jsonInput, setJsonInput] = useState("");
  const [parsedJson, setParsedJson] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBeautify = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setParsedJson(parsed);
      setJsonInput(JSON.stringify(parsed, null, 2)); // beautify with indentation
      setError(null);
    } catch (e: any) {
      setError("Invalid JSON: " + e.message);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <h2 className="text-lg font-semibold">Import / Paste JSON</h2>
      <Textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder="Paste your JSON here..."
        rows={8}
        className="font-mono text-sm"
      />
      <div className="flex gap-2">
        <Button onClick={handleBeautify}>Beautify & Show Tree</Button>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {parsedJson && (
        <div className="border rounded-lg p-2 bg-muted">
          <ReactJson
            src={parsedJson}
            name={false}
            collapsed={2}
            displayDataTypes={false}
            enableClipboard={true}
            theme="monokai"
          />
        </div>
      )}
    </div>
  );
}
