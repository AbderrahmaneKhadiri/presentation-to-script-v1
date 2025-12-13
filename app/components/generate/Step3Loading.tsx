"use client";
import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const loadingTexts = [
    "Analyse de la structure du document...",
    "Extraction du contenu des slides...",
    "Génération des images de prévisualisation...",
    "L'IA rédige vos scripts...",
    "Finalisation...",
];

export function Step3Loading() {
    const [currentText, setCurrentText] = useState(loadingTexts[0]);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % loadingTexts.length;
            setCurrentText(loadingTexts[index]);
        }, 2000); // Change le texte toutes les 2 secondes

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-4xl mx-auto text-center text-white flex flex-col items-center justify-center relative z-10">

            <div className="relative mb-8">
                {/* Pulsing Glow */}
                <div className="absolute inset-0 bg-emerald-500/30 blur-3xl rounded-full animate-pulse" />
                <div className="relative bg-emerald-950/50 backdrop-blur-xl p-6 rounded-full border border-emerald-500/20 shadow-2xl shadow-emerald-500/20">
                    <LoaderCircle className="h-16 w-16 animate-spin text-emerald-400" />
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">
                Génération en cours...
            </h2>

            <div className="h-8 overflow-hidden">
                <p className="text-emerald-100/80 text-xl font-medium animate-fade-in">
                    {currentText}
                </p>
            </div>

            <p className="mt-4 text-sm text-emerald-500/50">
                Cela peut prendre quelques secondes.
            </p>
        </div>
    );
}