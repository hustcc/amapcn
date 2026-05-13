"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Copy, Maximize2, Minimize2 } from "lucide-react";

interface BlockPreviewClientProps {
  blockName: string;
  source: string;
  highlightedCode: string;
  height?: string;
  children: React.ReactNode;
}

export function BlockPreviewClient({
  source,
  highlightedCode,
  height = "520px",
  children,
}: BlockPreviewClientProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const copySource = async () => {
    await navigator.clipboard.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "w-full rounded-lg border overflow-hidden",
        fullscreen && "fixed inset-0 z-50 rounded-none border-0"
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-3 h-10">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("preview")}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded transition-colors",
              activeTab === "preview"
                ? "text-foreground bg-muted dark:bg-muted/80"
                : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/80"
            )}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded transition-colors",
              activeTab === "code"
                ? "text-foreground bg-muted dark:bg-muted/80"
                : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/80"
            )}
          >
            Code
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={copySource}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Copy source"
          >
            {copied ? (
              <Check className="size-3 text-emerald-500" />
            ) : (
              <Copy className="size-3" />
            )}
            <span className="hidden sm:inline">Copy</span>
          </button>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {fullscreen ? (
              <Minimize2 className="size-3.5" />
            ) : (
              <Maximize2 className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className={cn("overflow-hidden", fullscreen ? "h-[calc(100vh-40px)]" : "")}
        style={!fullscreen ? { height } : undefined}
      >
        {activeTab === "preview" ? (
          <div className="h-full bg-muted/20">{children}</div>
        ) : (
          <div
            className="h-full overflow-auto bg-muted/20 p-4 text-sm [&_pre]:bg-transparent! [&_code]:bg-transparent!"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        )}
      </div>
    </div>
  );
}