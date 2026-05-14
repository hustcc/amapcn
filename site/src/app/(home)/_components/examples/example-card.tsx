"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ExampleCardProps {
  label: string;
  className?: string;
  delay?: string;
  children: React.ReactNode;
}

export function ExampleCard({
  label,
  className,
  delay = "delay-500",
  children,
}: ExampleCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl overflow-hidden shadow-sm bg-card border border-border/50 relative animate-scale-in",
        delay,
        className
      )}
    >
      {label && (
        <div className="uppercase absolute top-2 left-2 z-10 tracking-wider text-[10px] text-muted-foreground bg-background/90 backdrop-blur-sm rounded px-2 py-1">
          {label}
        </div>
      )}
      {visible ? children : <div className="h-full w-full bg-muted/20" />}
    </div>
  );
}
