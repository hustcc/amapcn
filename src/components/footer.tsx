import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full py-8 border-t border-border/40 bg-muted/20">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <span>© {new Date().getFullYear()} amapcn</span>
          <span className="text-border">•</span>
          <span>
            Built by{" "}
            <a
              href="https://github.com/hustcc"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline underline-offset-4"
            >
              hustcc
            </a>
          </span>
          <span className="text-border">•</span>
          <span>
            Inspired by{" "}
            <a
              href="https://github.com/AnmolSaini16/mapcn"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline underline-offset-4"
            >
              mapcn
            </a>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/blocks"
            className="hover:text-foreground transition-colors"
          >
            Blocks
          </Link>
          <Link
            href="/docs"
            className="hover:text-foreground transition-colors"
          >
            Documentation
          </Link>
          <a
            href="https://github.com/hustcc/amapcn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
