"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCard3DProps {
    icon: ReactNode;
    title: string;
    description: string;
    index: number;
}

export function FeatureCard3D({ icon, title, description, index }: FeatureCard3DProps) {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

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
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className="group relative"
        >
            <Card className="relative overflow-hidden border-emerald-800/50 bg-gradient-to-br from-emerald-950/90 to-emerald-900/50 backdrop-blur-xl transition-all duration-300 hover:border-emerald-600/50 hover:shadow-2xl hover:shadow-emerald-500/20">
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Animated gradient border */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

                <CardHeader className="relative items-center pb-4" style={{ transform: "translateZ(50px)" }}>
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-4 backdrop-blur-sm"
                    >
                        <div className="text-emerald-300">{icon}</div>
                    </motion.div>
                    <CardTitle className="text-center text-2xl font-bold text-white">
                        {title}
                    </CardTitle>
                </CardHeader>

                <CardContent className="relative" style={{ transform: "translateZ(25px)" }}>
                    <p className="text-center text-emerald-100/70 leading-relaxed">
                        {description}
                    </p>
                </CardContent>

                {/* Floating particles */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -10, 0],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                            duration: 2 + i,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.3,
                        }}
                        className="absolute w-1 h-1 bg-emerald-400/50 rounded-full blur-sm"
                        style={{
                            top: `${30 + i * 20}%`,
                            right: `${10 + i * 10}%`,
                            transform: "translateZ(75px)",
                        }}
                    />
                ))}
            </Card>
        </motion.div>
    );
}
