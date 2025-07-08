"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileImage, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  content: string;
  title: string;
}

export function ExportButton({ content, title }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const stripHtml = (html: string) => {
    // Create a temporary div element to strip HTML tags
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Replace common HTML elements with appropriate text formatting
    const text = tempDiv.textContent || tempDiv.innerText || "";
    return text.replace(/\s+/g, " ").trim();
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error("Download error:", error);
      return false;
    }
  };

  const exportAsTxt = async () => {
    setIsExporting(true);
    try {
      const plainText = stripHtml(content);
      const fullContent = `${title}\n${"=".repeat(
        title.length
      )}\n\n${plainText}`;

      const success = downloadFile(
        fullContent,
        `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`,
        "text/plain"
      );

      if (success) {
        toast({
          title: "Export successful",
          description: "Your note has been exported as a text file.",
        });
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("TXT export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export as text file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPdf = async () => {
    setIsExporting(true);
    try {
      const jsPDF = (await import("jspdf")).default;
      const doc = new jsPDF();

      const container = document.createElement("div");
      container.innerHTML = `
        <h1 style="font-size:18px;">${title}</h1>
        <div>${content}</div>
      `;
      container.style.padding = "20px";
      container.style.maxWidth = "800px";
      container.style.fontFamily = "sans-serif";

      document.body.appendChild(container);

      await doc.html(container, {
        callback: () => {
          doc.save(`${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`);
          toast({
            title: "Export successful",
            description: "Your note has been exported as a PDF file.",
          });
          document.body.removeChild(container);
          setIsExporting(false); // ✅ success path
          toast({
            title: "Export successful",
            description: "Your note has been exported as a PDF file.",
          });
        },
        x: 10,
        y: 10,
        width: 180, // A4 = 210mm - margin
        windowWidth: 800, // ensure images wrap correctly
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export as PDF. Please try again.",
        variant: "destructive",
      });
      setIsExporting(false);
    }
  };

  const exportAsHtml = async () => {
    setIsExporting(true);
    try {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px; 
            line-height: 1.6;
            color: #333;
        }
        h1 { 
            color: #2c3e50; 
            border-bottom: 3px solid #3498db; 
            padding-bottom: 10px; 
            margin-bottom: 30px;
        }
        h2, h3, h4, h5, h6 { color: #34495e; margin-top: 30px; }
        img { max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0; }
        table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 20px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
        }
        th { 
            background-color: #f8f9fa; 
            font-weight: 600;
            color: #2c3e50;
        }
        code { 
            background-color: #f8f9fa; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 0.9em;
        }
        pre { 
            background-color: #2c3e50; 
            color: #ecf0f1;
            padding: 20px; 
            border-radius: 8px; 
            overflow-x: auto;
            margin: 20px 0;
        }
        pre code {
            background: none;
            padding: 0;
            color: inherit;
        }
        blockquote { 
            border-left: 4px solid #3498db; 
            margin: 20px 0; 
            padding-left: 20px; 
            font-style: italic;
            color: #7f8c8d;
        }
        ul, ol { margin: 15px 0; padding-left: 30px; }
        li { margin: 5px 0; }
        a { color: #3498db; text-decoration: none; }
        a:hover { text-decoration: underline; }
        mark { background-color: #f1c40f; padding: 2px 4px; border-radius: 3px; }
        .footer { 
            margin-top: 50px; 
            padding-top: 20px; 
            border-top: 1px solid #eee; 
            text-align: center; 
            color: #7f8c8d; 
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="content">
        ${content}
    </div>
    <div class="footer">
        Exported from My Notepad on ${new Date().toLocaleDateString()}
    </div>
</body>
</html>`;

      const success = downloadFile(
        htmlContent,
        `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`,
        "text/html"
      );

      if (success) {
        toast({
          title: "Export successful",
          description: "Your note has been exported as an HTML file.",
        });
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("HTML export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export as HTML file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportAsTxt} disabled={isExporting}>
          <FileText className="w-4 h-4 mr-2" />
          Export as TXT
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsPdf} disabled={isExporting}>
          <FileImage className="w-4 h-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsHtml} disabled={isExporting}>
          <FileText className="w-4 h-4 mr-2" />
          Export as HTML
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
