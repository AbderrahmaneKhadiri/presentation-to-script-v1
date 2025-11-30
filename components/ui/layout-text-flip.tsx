"use client";
import React, { useState, useEffect } from "react";
// ✅ CORRECTION : L'import correct est "framer-motion", pas "motion/react"
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
 
export const LayoutTextFlip = ({
  text = "Build Amazing",
  words = ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"],
  duration = 3000,
  className, // On ajoute className pour la personnalisation
}: {
  text: string;
  words: string[];
  duration?: number;
  className?: string; // On ajoute className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
 
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);
 
    return () => clearInterval(interval);
  }, [words, duration]);
 
  return (
    <div className={cn("text-4xl md:text-7xl font-bold text-center", className)}>
      <motion.span
        layoutId="subtext"
        className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50"
      >
        {text}
      </motion.span>
 
      <motion.span
        layout
        className="relative inline-block w-fit overflow-hidden rounded-md border border-transparent bg-white px-4 py-2 text-black shadow-sm ring shadow-black/10 ring-black/10 drop-shadow-lg dark:bg-neutral-900 dark:text-white dark:shadow-sm dark:ring-1 dark:shadow-white/10 dark:ring-white/10"
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={currentIndex}
            initial={{ y: -40, filter: "blur(10px)", opacity: 0 }}
            animate={{
              y: 0,
              filter: "blur(0px)",
              opacity: 1,
            }}
            exit={{ y: 50, filter: "blur(10px)", opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
            }}
            className={cn("inline-block whitespace-nowrap")}
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </div>
  );
};