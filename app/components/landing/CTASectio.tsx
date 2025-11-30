"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    // CHANGEMENT : Le dégradé finit maintenant sur 'to-neutral-950' pour matcher le footer
    <section className="relative w-full py-32 overflow-hidden bg-gradient-to-b from-emerald-950 via-[#051510] to-neutral-950">

      {/* --- 1. SÉPARATEUR DU HAUT --- */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent blur-sm" />

      {/* --- 2. FOND TEXTURÉ (GRILLE) --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* --- 3. LUEUR CENTRALE --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Carte Glassmorphism */}
        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-16 text-center shadow-2xl shadow-black/50 relative overflow-hidden group">

          {/* Effet de brillance au survol de la carte */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Sparkles className="w-3 h-3" />
            <span>Offre de lancement</span>
          </div>

          {/* Titre */}
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Prêt à réussir votre<br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              prochaine présentation ?
            </span>
          </h2>

          {/* Sous-titre (Gris clair pour contraste) */}
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Rejoignez les centaines d'orateurs qui gagnent du temps et de l'impact.
            Transformez vos slides en discours parfaits en quelques secondes.
          </p>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-black hover:bg-neutral-200 font-bold text-lg px-8 py-6 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 transition-all duration-300">
              <Link href="/generate">
                Générer mon script
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <p className="mt-8 text-xs text-neutral-500 font-medium">
            Aucune carte bancaire requise pour l'essai gratuit.
          </p>
        </div>
      </div>
    </section>
  );
}