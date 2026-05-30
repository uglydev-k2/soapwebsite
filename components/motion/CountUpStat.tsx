"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface CountUpStatProps {
  value: string;
  className?: string;
}

function parseStat(value: string): {
  target: number;
  prefix: string;
  suffix: string;
  decimals: number;
} {
  const match = value.match(/^([^0-9.-]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
  if (!match) {
    return { target: 0, prefix: "", suffix: value, decimals: 0 };
  }

  const [, prefix, num, suffix] = match;
  const target = parseFloat(num);
  const decimals = num.includes(".") ? num.split(".")[1].length : 0;
  return { target, prefix, suffix, decimals };
}

export function CountUpStat({ value, className }: CountUpStatProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const { target, prefix, suffix, decimals } = parseStat(value);

  useEffect(() => {
    if (reduced || !inView) {
      setDisplay(value);
      return;
    }

    const duration = 550;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      setDisplay(`${prefix}${current.toFixed(decimals)}${suffix}`);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [inView, reduced, value, target, prefix, suffix, decimals]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
