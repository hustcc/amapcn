import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function BlocksPageHeader() {
  return (
    <div className="container flex flex-col items-center text-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight animate-fade-up delay-100">
        <span className="bg-linear-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
          Map blocks for your application
        </span>
      </h1>

      <p className="mt-4 text-foreground/80 text-base md:text-lg leading-relaxed animate-fade-up delay-200 max-w-2xl">
        Pre-built, ready-to-use map blocks. Browse, preview, and copy them into
        your app with one command.
      </p>

      <div className="mt-6 flex flex-wrap justify-center items-center gap-3 animate-fade-up delay-300">
        <Button asChild>
          <a href="#blocks">
            Browse Blocks
            <ArrowRight className="size-4" />
          </a>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/docs">View Documentation</Link>
        </Button>
      </div>
    </div>
  );
}