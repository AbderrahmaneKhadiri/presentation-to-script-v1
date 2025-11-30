"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { UploadCloud, Cpu, MicVocal, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepsSection() {
    return (
        <section id="how-it-works" className="py-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-400/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-white mb-6"
                    >
                        Comment ça marche ?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-neutral-300 max-w-2xl mx-auto"
                    >
                        Trois étapes simples pour transformer vos présentations en discours captivants.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <StepCard
                        number="01"
                        title="Import Facile"
                        description="Déposez votre fichier .pptx ou .pdf. Nous analysons la structure visuelle et textuelle instantanément."
                        icon={<UploadCloud className="w-10 h-10 text-white" />}
                        delay={0.2}
                    />
                    <StepCard
                        number="02"
                        title="IA Oratoire"
                        description="Choisissez votre ton (Simple, Pro, Détaillé). Notre IA rédige un script sur-mesure pour chaque slide, adapté à l'oral."
                        icon={<Cpu className="w-10 h-10 text-white" />}
                        delay={0.3}
                    />
                    <StepCard
                        number="03"
                        title="Mode Répétition"
                        description="Utilisez notre lecteur immersif avec chronomètre intégré pour vous entraîner en conditions réelles."
                        icon={<MicVocal className="w-10 h-10 text-white" />}
                        delay={0.4}
                    />
                </div>
            </div>
        </section>
    );
}

function StepCard({ number, title, description, icon, delay }: { number: string; title: string; description: string; icon: React.ReactNode; delay: number }) {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            style={{
                perspective: 1000,
            }}
            className="w-full h-full"
        >
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className="relative h-full w-full rounded-3xl bg-gradient-to-br from-emerald-900/50 to-emerald-950/50 border border-emerald-800/50 p-8 flex flex-col items-start gap-4 group hover:border-emerald-500/50 transition-colors duration-300"
            >
                {/* 3D Floating Elements */}
                <div
                    style={{ transform: "translateZ(75px)" }}
                    className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-colors duration-500"
                />

                <div
                    style={{ transform: "translateZ(50px)" }}
                    className="mb-4 p-4 rounded-2xl bg-emerald-950 border border-emerald-800 shadow-xl group-hover:border-emerald-500/50 transition-colors duration-300"
                >
                    {icon}
                </div>

                <div style={{ transform: "translateZ(25px)" }} className="space-y-2">
                    <span className="text-5xl font-bold text-emerald-500/20 font-mono absolute top-8 right-8 select-none">
                        {number}
                    </span>
                    <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors duration-300">
                        {title}
                    </h3>
                    <p className="text-neutral-400 leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Bottom Glow */}
                <div
                    className="absolute inset-0 rounded-3xl bg-gradient-to-t from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ transform: "translateZ(0px)" }}
                />
            </motion.div>
        </motion.div>
    );
}
