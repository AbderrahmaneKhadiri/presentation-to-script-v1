"use client";
import React from "react";
import { cn } from "@/lib/utils";

export function SectionSeparator({ className }: { className?: string }) {
    return (
        <div className={cn("relative w-full h-px my-8", className)}>
            {/* La ligne lumineuse centrale */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-70" />

            {/* L'effet de flou (Glow) autour de la ligne */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent blur-sm opacity-50" />

            {/* Une lueur radiale centrale pour accentuer l'effet */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-20 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
        </div>
    );
}