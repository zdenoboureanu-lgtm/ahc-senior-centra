"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealOnScrollProps {
  children: ReactNode;
  /** Delay in ms před spuštěním fade-up animace */
  delay?: number;
  /** Posun zdola — default 24px */
  distance?: number;
  className?: string;
  as?: "div" | "section" | "article";
}

/**
 * Obal sekce nebo bloku — spustí fade-up animaci když se element dostane
 * do viewportu (IntersectionObserver).
 *
 * Respektuje `prefers-reduced-motion` (animace se vůbec nespustí, content je viditelný).
 */
export function RevealOnScroll({
  children,
  delay = 0,
  distance = 24,
  className,
  as = "div",
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Tag = as;

  return (
    <Tag
      ref={ref as never}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0,0,0)" : `translate3d(0, ${distance}px, 0)`,
        transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
