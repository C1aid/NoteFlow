"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/landing/motion";
import { cn } from "@/lib/utils";

type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="mx-auto mt-8 max-w-2xl divide-y divide-white/8 sm:mt-12">
      {items.map((item, index) => {
        const isOpen = openItems.has(index);

        return (
          <Reveal key={item.question} as="div" delay={index * 85} y={20}>
            <div className="py-4 sm:py-5">
            <button
              type="button"
              className="flex w-full touch-manipulation items-start justify-between gap-3 rounded-lg text-left text-[15px] font-medium leading-snug transition-smooth hover:text-primary sm:items-center sm:gap-4 sm:text-base"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
            >
              <span className="min-w-0 flex-1">{item.question}</span>
              <ChevronDown
                className={cn(
                  "faq-chevron h-4 w-4 shrink-0 text-muted-foreground",
                  isOpen && "faq-chevron-open",
                )}
              />
            </button>

            <div className={cn("faq-content", isOpen && "faq-content-open")}>
              <div>
                <p className="faq-answer pt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
