"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight-new";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";

// Imports de vos composants de sections
import { Footer } from "@/app/components/landing/Footer";
import { CTASection } from "@/app/components/landing/CTASectio"; // Attention à la coquille dans votre nom de fichier original 'CTASectio'
import { HowItWorks3D } from "@/app/components/landing/HowItWorks3D";
import { SectionSeparator } from "@/components/ui/SectionSeparator";
export default function HomePage() {
  return (
    <main className="min-h-screen relative bg-emerald-950 selection:bg-emerald-500/30">

      {/* =========================================
          SECTION 1 : HÉRO (ACCUEIL)
      ========================================= */}
      <div className="h-screen w-full flex items-center justify-center bg-transparent antialiased relative overflow-hidden">

        {/* Effet de lumière en haut */}
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

        <div className="container p-4 mx-auto relative z-10 w-full flex flex-col items-center justify-center">

          {/* Badge "Nouveau" */}
          <div className="mb-6 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm font-medium animate-fade-in backdrop-blur-sm shadow-lg shadow-emerald-500/10">
            ✨ Nouveau : Support PDF et PowerPoint
          </div>

          {/* Titre Animé */}
          <LayoutTextFlip
            text="Transformez vos slides en scripts "
            words={["percutants.", "captivants.", "professionnels.", "inoubliables."]}
          />

          {/* Sous-titre */}
          <p className="mt-8 font-normal text-lg text-neutral-300 max-w-2xl text-center mx-auto leading-relaxed">
            Déposez votre fichier PowerPoint ou PDF et laissez notre IA générer un discours professionnel pour chaque slide.
            <span className="block mt-2 text-emerald-200/90 font-medium">
              Gagnez des heures de préparation et captivez votre audience.
            </span>
          </p>

          {/* Boutons d'action */}
          <div className="mt-10 flex gap-4 flex-col sm:flex-row items-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-emerald-950 hover:bg-neutral-100 font-bold px-8 py-6 text-lg rounded-xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300"
            >
              <Link href="/generate">Commencer gratuitement</Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-emerald-700/50 text-emerald-100 hover:bg-emerald-900/50 hover:border-emerald-500 px-8 py-6 text-lg rounded-xl backdrop-blur-sm transition-all duration-300"
            >
              <Link href="#how-it-works">Comment ça marche ?</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* =========================================
          SÉPARATEUR STYLÉ
      ========================================= */}
      {/* Positionné en négatif pour chevaucher légèrement la fin du Héro */}
      <div className="relative z-20 -mt-24 mb-12 container mx-auto px-4">
        <SectionSeparator />
      </div>

      {/* =========================================
          SECTION 2 : COMMENT ÇA MARCHE (3D)
      ========================================= */}
      <div id="how-it-works">
        <HowItWorks3D />
      </div>

      {/* =========================================
          SECTION 3 : APPEL À L'ACTION (CTA)
      ========================================= */}
      <CTASection />

      {/* =========================================
          FOOTER
      ========================================= */}
      <Footer />

    </main>
  );
}