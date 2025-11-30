"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight-new";

export function Hero3D() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <div ref={ref} className="h-screen w-full flex items-center justify-center bg-emerald-950 antialiased bg-grid-white/[0.05] relative overflow-hidden">
            <Spotlight
                className="-top-40 left-0 md:left-60 md:-top-20"
                fill="white"
            />

            {/* Floating geometric shapes */}
            <motion.div
                style={{ y }}
                className="absolute inset-0 z-0"
            >
                {/* Large circle */}
                <motion.div
                    animate={{
                        y: [0, -30, 0],
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 rounded-full blur-3xl"
                />

                {/* Medium circle */}
                <motion.div
                    animate={{
                        y: [0, 40, 0],
                        rotate: [360, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-teal-400/20 to-cyan-600/20 rounded-full blur-3xl"
                />

                {/* Small floating elements */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -20, 0],
                            x: [0, 10, 0],
                            rotate: [0, 180, 360],
                        }}
                        transition={{
                            duration: 10 + i * 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.5,
                        }}
                        className="absolute w-4 h-4 bg-emerald-400/30 rounded-full blur-sm"
                        style={{
                            top: `${20 + i * 15}%`,
                            left: `${10 + i * 20}%`,
                        }}
                    />
                ))}
            </motion.div>

            {/* Main content */}
            <motion.div
                style={{ opacity }}
                className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center"
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/50 px-4 py-2 backdrop-blur-xl">
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-300">
                            Propulsé par l'IA
                        </span>
                    </div>
                </motion.div>

                {/* Main heading with gradient */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
                >
                    Transformez vos{" "}
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                        présentations
                    </span>
                    <br />
                    en scripts{" "}
                    <span className="relative">
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                            captivants
                        </span>
                        <motion.span
                            animate={{
                                scaleX: [0, 1],
                            }}
                            transition={{
                                duration: 0.8,
                                delay: 0.8,
                            }}
                            className="absolute -bottom-2 left-0 h-1 w-full origin-left bg-gradient-to-r from-emerald-400 to-cyan-400"
                        />
                    </span>
                </motion.h1>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-8 max-w-2xl text-lg text-emerald-100/80 sm:text-xl"
                >
                    Déposez votre fichier PowerPoint ou PDF et laissez notre IA générer
                    un discours professionnel pour chaque slide. Gagnez des heures de
                    préparation.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-10 flex flex-col gap-4 sm:flex-row"
                >
                    <Button
                        asChild
                        size="lg"
                        className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6 text-lg font-semibold text-white shadow-2xl shadow-emerald-500/50 transition-all hover:shadow-emerald-500/80 hover:scale-105"
                    >
                        <Link href="/generate" className="flex items-center gap-2">
                            Commencer gratuitement
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>

                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="border-emerald-500/50 bg-emerald-950/50 px-8 py-6 text-lg font-semibold text-emerald-100 backdrop-blur-xl hover:bg-emerald-900/50 hover:border-emerald-400"
                    >
                        <Link href="#features">Découvrir les fonctionnalités</Link>
                    </Button>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 grid grid-cols-3 gap-8 sm:gap-12"
                >
                    {[
                        { value: "10k+", label: "Scripts générés" },
                        { value: "95%", label: "Satisfaction" },
                        { value: "5min", label: "Temps moyen" },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-3xl font-bold text-white sm:text-4xl">
                                {stat.value}
                            </div>
                            <div className="mt-1 text-sm text-emerald-300/80">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </motion.div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-950 to-transparent" />
        </div>
    );
}
