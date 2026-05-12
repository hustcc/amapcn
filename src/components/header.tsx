import { Heart, MapPin } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
            <span className="font-semibold tracking-tight">ai-map</span>
          </Link>
        </div>
        <div className="flex items-center gap-2 h-4.5">
          <CommandSearch />
          <Separator orientation="vertical" className="hidden sm:block" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" asChild>
                <a
                  href="https://github.com/sponsors/hustcc"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Heart className="size-4 text-pink-500" />
                  <span className="hidden sm:inline">Sponsor</span>
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sponsor this project</p>
            </TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" />
          <GitHubButton />
          <Separator orientation="vertical" />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
