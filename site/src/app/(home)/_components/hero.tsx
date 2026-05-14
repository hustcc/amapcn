"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://map.ling.pub";
const installCommand = `npx shadcn@latest add ${siteUrl}/r/amap.json`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? (
        <Check className="size-4 text-emerald-500" />
      ) : (
        <Copy className="size-4" />
      )}
    </button>
  );
}

export function Hero() {
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="absolute -top-40 -right-40 size-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-96 bg-sky-500/10 rounded-full blur-3xl" />

        <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background" />
      </div>

      <div className="container flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight animate-fade-up delay-100">
          <span className="bg-linear-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
            Beautiful maps for China, made simple.
          </span>
        </h1>

        <p className="mt-6 text-foreground/80 text-lg md:text-xl leading-relaxed animate-fade-up delay-200 max-w-lg">
          Ready to use, customizable map components for React.
          <br className="hidden sm:block" />
          Built on AMap. Styled with Tailwind.
        </p>

        <div className="mt-8 animate-fade-up delay-300 w-full max-w-xl">
          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/50">
              <span className="size-2.5 rounded-full bg-red-500/40" />
              <span className="size-2.5 rounded-full bg-yellow-500/40" />
              <span className="size-2.5 rounded-full bg-green-500/40" />
            </div>

            <div className="flex items-center gap-3 px-4 py-3 font-mono text-sm">
              <span className="text-emerald-500 shrink-0">$</span>
              <code className="text-foreground/80 truncate flex-1 text-left">
                {installCommand}
              </code>
              <CopyButton text={installCommand} />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center items-center gap-3 animate-fade-up delay-400">
          <Button size="lg" asChild>
            <Link href="/docs">
              Get Started
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" asChild>
            <Link href="/docs/basic-map" className="text-muted-foreground">
              View Components
            </Link>
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <a href="https://github.com/hustcc/ai-map/tree/main/amapcn-skill" target="_blank" rel="noopener noreferrer" className="text-muted-foreground">
              🤖 Claude Skill
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
