"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Chrome, CircleCheck } from "lucide-react";
import { fadeUp, viewportOnce } from "@/animations/variants";
import { useAuth } from "@/components/AuthContext";

export default function FinalCTA() {
  const { user } = useAuth();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAdded(localStorage.getItem("propar_added_to_chrome") === "true");
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAdded(localStorage.getItem("propar_added_to_chrome") === "true");
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("propar_chrome_added", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("propar_chrome_added", handleStorageChange);
    };
  }, []);

  const handleAddClick = (e: React.MouseEvent) => {
    if (user) {
      e.preventDefault();
      localStorage.setItem("propar_added_to_chrome", "true");
      setIsAdded(true);
      window.dispatchEvent(new Event("propar_chrome_added"));
    }
  };
  return (
    <section id="final-cta" className="py-24 md:py-32">
      <div className="container-content">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="relative overflow-hidden rounded-[2rem] bg-ink px-8 py-20 text-center"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/30 blur-3xl"
          />
          <p className="eyebrow mb-5 text-white/50">Before your next send</p>
          <h2 className="font-display text-[clamp(2rem,4.5vw,3.25rem)] italic leading-tight text-white">
            Think before you send.
          </h2>
          <p className="mx-auto mt-5 max-w-[42ch] text-[16px] text-white/70">
            Free to install. Works the moment you open Gmail, LinkedIn, or your favorite AI assistant.
          </p>
          {user && isAdded ? (
            <div
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-green-500 px-7 py-3.5 text-[15px] font-semibold text-white shadow-soft transition-all duration-300"
            >
              <CircleCheck size={18} className="stroke-[2.5]" />
              ProPar is added
            </div>
          ) : (
            <a
              href="/auth/login"
              onClick={handleAddClick}
              className="focus-ring mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-medium text-ink transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <Chrome size={17} />
              Add to Chrome — it&rsquo;s free
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}
