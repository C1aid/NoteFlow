"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type MotionObserverOptions = {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
};

function useMotionInView<T extends HTMLElement>(
  options: MotionObserverOptions = {},
) {
  const { threshold = 0.12, rootMargin = "0px 0px -2% 0px", once = true } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersecting = entry?.isIntersecting ?? false;
        if (intersecting) {
          setInView(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** Opacity-only reveal — safe to wrap buttons, toggles, and links. */
  safe?: boolean;
  as?: "div" | "section" | "article" | "li" | "footer";
};

export function Reveal({
  children,
  className,
  delay = 0,
  y = 36,
  safe = false,
  as: Tag = "div",
}: RevealProps) {
  const { ref, inView } = useMotionInView<HTMLDivElement>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!inView) {
      setReady(false);
      return;
    }

    if (safe) {
      setReady(true);
    }
  }, [inView, safe]);

  const motionClass = safe ? "motion-reveal-safe" : "motion-reveal";
  const visibleClass = safe ? "motion-reveal-safe-visible" : "motion-reveal-visible";

  return (
    <Tag
      ref={ref as never}
      className={cn(
        motionClass,
        inView && visibleClass,
        (safe || ready) && inView && "motion-reveal-ready",
        className,
      )}
      style={
        safe
          ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties)
          : ({
              "--reveal-delay": `${delay}ms`,
              "--reveal-y": `${y}px`,
            } as React.CSSProperties)
      }
      onTransitionEnd={(event) => {
        if (
          !safe &&
          inView &&
          (event.propertyName === "transform" || event.propertyName === "opacity")
        ) {
          setReady(true);
        }
      }}
    >
      {children}
    </Tag>
  );
}

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <div
      className={cn("motion-fade", className)}
      style={{ "--motion-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

type RevealTextProps = {
  text: string;
  className?: string;
  delay?: number;
  wordDelay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
};

export function RevealText({
  text,
  className,
  delay = 0,
  wordDelay = 70,
  as: Tag = "span",
}: RevealTextProps) {
  const { ref, inView } = useMotionInView<HTMLElement>({
    threshold: 0.2,
    rootMargin: "0px 0px -2% 0px",
  });
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={cn("motion-word", inView && "motion-word-visible")}
          style={
            { "--word-delay": `${delay + index * wordDelay}ms` } as React.CSSProperties
          }
        >
          {word}
          {index < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
}

type AnimatedHeadingProps = {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  charDelay?: number;
};

export function AnimatedHeading({
  text,
  className,
  style,
  delay = 200,
  charDelay = 28,
}: AnimatedHeadingProps) {
  const lines = text.split("\n");
  let charIndex = 0;

  return (
    <h1
      className={cn(className)}
      style={style}
      aria-label={text.replace(/\n/g, " ")}
    >
      {lines.map((line, lineIndex) => (
        <div
          key={lineIndex}
          className="flex flex-wrap justify-center gap-x-[0.28em]"
        >
          {line.split(/\s+/).filter(Boolean).map((word, wordIndex) => (
            <span key={wordIndex} className="inline-flex whitespace-nowrap">
              {word.split("").map((char) => {
                const index = charIndex++;
                return (
                  <span
                    key={index}
                    className="hero-char"
                    style={
                      {
                        "--char-index": index,
                        "--hero-delay": `${delay}ms`,
                        "--char-step": `${charDelay}ms`,
                      } as React.CSSProperties
                    }
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          ))}
        </div>
      ))}
    </h1>
  );
}
