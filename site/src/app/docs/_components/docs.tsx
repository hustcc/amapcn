import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DocsToc } from "./docs-toc";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface TocItem {
  title: string;
  slug: string;
}

// DocsHeader - Page title and description
interface DocsHeaderProps {
  title: string;
  description: string;
}

export function DocsHeader({ title, description }: DocsHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="text-base text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// DocsLayout - Full page wrapper with nav
interface DocsLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
  toc?: TocItem[];
}

export function DocsLayout({
  title,
  description,
  children,
  prev,
  next,
  toc = [],
}: DocsLayoutProps) {
  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0 max-w-[720px] mx-auto py-8 pb-20">
        <DocsHeader title={title} description={description} />

        <div className="mt-10 space-y-10">{children}</div>

        {(prev || next) && (
          <div className="flex items-center justify-between gap-4 mt-14 pt-8 border-t">
            {prev ? (
              <Link
                href={prev.href}
                className="group flex flex-col items-start gap-1.5"
              >
                <span className="text-xs text-muted-foreground">Previous</span>
                <span className="text-sm font-medium group-hover:underline underline-offset-4">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {next && (
              <Link
                href={next.href}
                className="group flex flex-col items-end gap-1.5"
              >
                <span className="text-xs text-muted-foreground">Next</span>
                <span className="text-sm font-medium group-hover:underline underline-offset-4">
                  {next.title}
                </span>
              </Link>
            )}
          </div>
        )}
      </div>

      <aside className="hidden xl:block w-44 shrink-0">
        <nav className="sticky top-28">
          {toc.length > 0 && <DocsToc items={toc} />}
        </nav>
      </aside>
    </div>
  );
}

// DocsSection - Content section with optional title
interface DocsSectionProps {
  title?: string;
  children: React.ReactNode;
}

export function DocsSection({ title, children }: DocsSectionProps) {
  const id = title ? slugify(title) : undefined;
  return (
    <section className="space-y-4 scroll-mt-20" id={id}>
      {title && (
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      )}
      <div className="text-foreground/80 text-base sm:text-[15px] leading-7 space-y-3 [&_p]:leading-7 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_li]:leading-7 [&_strong]:text-foreground [&_strong]:font-medium [&_em]:text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

// DocsNote - Highlighted note/callout
interface DocsNoteProps {
  children: React.ReactNode;
}

export function DocsNote({ children }: DocsNoteProps) {
  return (
    <div className="rounded-lg border bg-muted/40 px-4 py-3 text-[14px] leading-relaxed text-foreground/70 [&_strong]:text-foreground [&_strong]:font-medium">
      {children}
    </div>
  );
}

// DocsLink - Styled link
interface DocsLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}

export function DocsLink({ href, children, external }: DocsLinkProps) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
    >
      {children}
    </Link>
  );
}

// DocsCode - Inline code
export function DocsCode({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
        className
      )}
    >
      {children}
    </code>
  );
}

// DocsPropTable - API reference table for component props
interface DocsPropTableProps {
  props: {
    name: string;
    type: string;
    default?: string;
    description: string;
  }[];
}

export function DocsPropTable({ props }: DocsPropTableProps) {
  return (
    <div className="rounded-lg border overflow-hidden my-6">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-muted/30">
            <TableHead className="h-10 px-4 text-xs font-medium">
              Prop
            </TableHead>
            <TableHead className="h-10 px-4 text-xs font-medium">
              Type
            </TableHead>
            <TableHead className="h-10 px-4 text-xs font-medium">
              Default
            </TableHead>
            <TableHead className="h-10 px-4 text-xs font-medium">
              Description
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.map((prop) => (
            <TableRow key={prop.name}>
              <TableCell className="px-4 py-3 align-top">
                <DocsCode className="text-[13px]">{prop.name}</DocsCode>
              </TableCell>
              <TableCell className="px-4 py-3 align-top whitespace-normal">
                <DocsCode className="text-xs text-muted-foreground">
                  {prop.type}
                </DocsCode>
              </TableCell>
              <TableCell className="px-4 py-3 align-top">
                <DocsCode className="text-xs text-muted-foreground whitespace-normal">
                  {prop.default ?? "—"}
                </DocsCode>
              </TableCell>
              <TableCell className="px-4 py-3 text-sm text-foreground/70 whitespace-normal min-w-[180px] leading-relaxed">
                {prop.description}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
