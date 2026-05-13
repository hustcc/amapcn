import { MapPin } from "lucide-react";
import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { GitHubButton } from "@/components/github-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandSearch } from "@/components/command-search";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
  leftContent?: React.ReactNode;
}

export function Header({ className, leftContent }: HeaderProps) {
  return (
    <header className={cn("w-full h-16", className)}>
      <nav className="flex size-full items-center justify-between container">
        <div className="flex items-center gap-4">
          {leftContent}
          <Link
            href="/"
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <MapPin className="size-4" />
            <span className="font-semibold tracking-tight">amapcn</span>
          </Link>
          <Separator orientation="vertical" className="hidden sm:block" />
          <Link
            href="/blocks"
            className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Blocks
          </Link>
          <Link
            href="/docs"
            className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Docs
          </Link>
        </div>
        <div className="flex items-center gap-2 h-4.5">
          <CommandSearch />
          <Separator orientation="vertical" className="hidden sm:block" />
          <GitHubButton />
          <Separator orientation="vertical" />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
