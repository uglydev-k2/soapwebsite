"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${8 + ((i * 13) % 84)}%`,
  top: `${10 + ((i * 17) % 80)}%`,
  size: 4 + (i % 3) * 2,
  duration: 12 + (i % 5) * 2,
  delay: (i % 6) * 0.4,
}));

export function BotanicalParticles() {
  const reduced = useReducedMotion();
  const particles = useMemo(() => PARTICLES, []);

  if (reduced) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-gold/20"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -18, 0],
            x: [0, p.id % 2 === 0 ? 8 : -8, 0],
            opacity: [0.15, 0.45, 0.15],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
