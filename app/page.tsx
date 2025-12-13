"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs"; // 1. Import ajouté ici
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight-new";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { Loader2, Presentation } from "lucide-react";

import { Footer } from "@/app/components/landing/Footer";
import { CTASection } from "@/app/components/landing/CTASectio";
import { HowItWorks3D } from "@/app/components/landing/HowItWorks3D";
import { SectionSeparator } from "@/components/ui/SectionSeparator";
import { DashboardSkeleton } from "@/app/components/skeletons/DashboardSkeleton";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.push("/generate");
    } else {
      const timer = setTimeout(() => {
        setShowLanding(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn, router]);

  // Cas utilisateur connecté ou chargement
  if (isLoaded && isSignedIn) {
    return <DashboardSkeleton />;
  }

  if (!isLoaded || !showLanding) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-emerald-950 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="relative z-10 flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500">
          <div className="p-5 rounded-2xl bg-emerald-900/30 border border-emerald-500/20 shadow-2xl backdrop-blur-md">
            <Presentation className="h-16 w-16 text-emerald-400" />
          </div>
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-emerald-200 animate-spin" />
            <p className="text-emerald-100/60 text-sm font-medium tracking-widest uppercase animate-pulse">
              Chargement...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- LANDING PAGE ---
  return (
    <main className="min-h-screen relative bg-emerald-950 selection:bg-emerald-500/30 animate-in fade-in duration-700">

      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent antialiased relative overflow-hidden pt-32 pb-32 lg:pt-40 lg:pb-0">

        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

        <div className="container p-4 mx-auto relative z-10 w-full flex flex-col items-center justify-center">

          <div className="mb-6 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm font-medium animate-fade-in backdrop-blur-sm shadow-lg shadow-emerald-500/10">
            ✨ Nouveau : Support PDF et PowerPoint
          </div>

          <LayoutTextFlip
            text="Transformez vos slides en scripts "
            words={["percutants.", "captivants.", "professionnels.", "inoubliables."]}
            className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight"
          />

          <p className="mt-8 font-normal text-base md:text-lg text-neutral-300 max-w-2xl text-center mx-auto leading-relaxed px-4">
            Déposez votre fichier PowerPoint ou PDF et laissez notre IA générer un discours professionnel pour chaque slide.
            <span className="block mt-2 text-emerald-200/90 font-medium">
              Gagnez des heures de préparation et captivez votre audience.
            </span>
          </p>

          <div className="mt-10 flex gap-4 flex-col sm:flex-row items-center w-full sm:w-auto px-4">

            {/* 
               MODIFICATION ICI : 
               Utilisation de SignInButton pour ouvrir le modal de connexion Clerk
            */}
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-emerald-950 hover:bg-neutral-100 font-bold px-8 py-6 text-lg rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300"
              >
                Commencer gratuitement
              </Button>
            </SignInButton>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-emerald-700/50 text-emerald-100 hover:bg-emerald-900/50 hover:border-emerald-500 px-8 py-6 text-lg rounded-xl backdrop-blur-sm transition-all duration-300"
            >
              <Link href="#how-it-works">Comment ça marche ?</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-20 mb-24 container mx-auto px-4">
        <SectionSeparator />
      </div>

      <div id="how-it-works">
        <HowItWorks3D />
      </div>

      <CTASection />

      <Footer />

    </main>
  );
}