"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Wraps Framer Motion's useReducedMotion so components can pull a single
 * boolean and short-circuit any non-essential motion consistently.
 */
export function useReducedMotionSafe() {
  const prefersReduced = useReducedMotion();
  return Boolean(prefersReduced);
}
