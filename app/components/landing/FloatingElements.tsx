"use client";

import { motion } from "framer-motion";

export function FloatingElements() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Large floating orbs */}
            <motion.div
                animate={{
                    y: [0, -100, 0],
                    x: [0, 50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 blur-3xl"
            />

            <motion.div
                animate={{
                    y: [0, 100, 0],
                    x: [0, -50, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-3xl"
            />

            {/* Medium floating shapes */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, 20, 0],
                        rotate: [0, 180, 360],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 15 + i * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.5,
                    }}
                    className="absolute h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/5 to-teal-400/5 blur-2xl"
                    style={{
                        top: `${10 + i * 15}%`,
                        left: `${5 + i * 15}%`,
                    }}
                />
            ))}

            {/* Small particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={`particle-${i}`}
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: 5 + (i % 3),
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.2,
                    }}
                    className="absolute h-2 w-2 rounded-full bg-emerald-400/30 blur-sm"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                    }}
                />
            ))}

            {/* Geometric shapes */}
            <motion.div
                animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-1/4 right-1/4 h-24 w-24 border border-emerald-500/10 bg-emerald-500/5 backdrop-blur-sm"
                style={{
                    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                }}
            />

            <motion.div
                animate={{
                    rotate: [360, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute bottom-1/3 left-1/3 h-20 w-20 border border-teal-500/10 bg-teal-500/5 backdrop-blur-sm"
                style={{
                    clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                }}
            />
        </div>
    );
}
