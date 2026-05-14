"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function useActiveItem(itemIds: string[]) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0% 0% -80% 0%" }
    );

    for (const id of itemIds ?? []) {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => {
      for (const id of itemIds ?? []) {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      }
    };
  }, [itemIds]);

  return activeId;
}

interface TocItem {
  title: string;
  slug: string;
}

interface DocsTocProps {
  items: TocItem[];
  className?: string;
}

export function DocsToc({ items, className }: DocsTocProps) {
  const itemIds = React.useMemo(() => items.map((item) => item.slug), [items]);
  const activeHeading = useActiveItem(itemIds);

  if (!items?.length) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-2.5 text-sm", className)}>
      <p className="text-muted-foreground text-xs font-medium mb-1">
        On This Page
      </p>
      {items.map((item) => (
        <a
          key={item.slug}
          href={`#${item.slug}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(item.slug)?.scrollIntoView({
              behavior: "smooth",
            });
          }}
          className={cn(
            "text-muted-foreground hover:text-foreground text-[0.8rem] no-underline transition-colors",
            item.slug === activeHeading && "text-foreground"
          )}
        >
          {item.title}
        </a>
      ))}
    </div>
  );
}
