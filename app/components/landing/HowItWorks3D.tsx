"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, Mic, Settings2, Play, ChevronDown, Globe, TrendingUp, Edit, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// --- DONNÉES ---
const steps = [
  {
    id: 1,
    title: "Importez votre fichier",
    description: "Déposez votre présentation PowerPoint ou PDF. Nous analysons la structure instantanément.",
    icon: <UploadCloud className="w-6 h-6" />,
  },
  {
    id: 2,
    title: "Configurez l'IA",
    description: "Choisissez le ton et la durée. L'IA génère un script sur-mesure pour chaque slide.",
    icon: <FileText className="w-6 h-6" />,
  },
  {
    id: 3,
    title: "Entraînez-vous",
    description: "Utilisez notre lecteur immersif : vos slides synchronisées avec le script pour performer.",
    icon: <Mic className="w-6 h-6" />,
  },
];

const styleOptions = [
  { id: 1, label: "Simple et direct", desc: "Phrases courtes.", active: false },
  { id: 2, label: "Normal et engageant", desc: "Équilibré.", active: true },
  { id: 3, label: "Professionnel", desc: "Vocabulaire technique.", active: false },
];

const lengthOptions = [
  { id: 1, label: "Court", desc: "~1 min", active: false },
  { id: 2, label: "Moyen", desc: "~2 min", active: true },
  { id: 3, label: "Long", desc: "~3+ min", active: false },
];

// --- COMPOSANT PRINCIPAL ---
export function HowItWorks3D() {
  const [activeStep, setActiveStep] = useState(1);

  // Auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev === 3 ? 1 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 relative overflow-hidden bg-emerald-950">

      {/* Fond Grille 3D */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none [perspective:200px]">
        <div className="absolute inset-0 [transform:rotateX(35deg)]">
          <div className="absolute inset-0 -top-[100%] bg-[linear-gradient(to_right,rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px] h-[200%]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/50 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Du fichier au discours en <span className="text-emerald-400">3 étapes</span>
          </h2>
          <p className="text-emerald-200/60 text-lg">Simple, rapide et efficace.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* GAUCHE : Contrôles */}
          <div className="space-y-6">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={cn(
                  "w-full text-left p-6 rounded-2xl transition-all duration-300 border group relative overflow-hidden",
                  activeStep === step.id
                    ? "bg-white/5 border-emerald-500/50 shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]"
                    : "bg-transparent border-white/5 hover:bg-white/5 hover:border-white/10"
                )}
              >
                {activeStep === step.id && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent"
                    transition={{ duration: 0.3 }}
                  />
                )}
                <div className="relative z-10 flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-xl transition-colors duration-300",
                    activeStep === step.id ? "bg-emerald-500 text-emerald-950" : "bg-white/5 text-emerald-400"
                  )}>
                    {step.icon}
                  </div>
                  <div>
                    <h3 className={cn(
                      "text-xl font-bold mb-2 transition-colors duration-300",
                      activeStep === step.id ? "text-white" : "text-emerald-100/60"
                    )}>
                      {step.title}
                    </h3>
                    <p className="text-emerald-200/50 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* DROITE : Visualisation 3D */}
          <div className="relative h-[480px] w-full [perspective:1000px] group">
            <motion.div
              className="absolute inset-x-2 top-0 bottom-0 bg-emerald-950 backdrop-blur-xl border border-emerald-500/20 rounded-3xl overflow-hidden shadow-2xl"
              initial={{ rotateX: 10, rotateY: -10, scale: 0.9 }}
              animate={{
                rotateX: 5,
                rotateY: -5,
                scale: 1,
                y: [0, -10, 0]
              }}
              transition={{
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                default: { duration: 0.8 }
              }}
            >
              {/* Barre de titre */}
              <div className="h-8 border-b border-white/5 bg-black/20 flex items-center px-4 gap-2 z-20 relative">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
              </div>

              {/* Contenu dynamique */}
              <div className="h-[calc(100%-32px)] relative">
                <AnimatePresence mode="wait">

                  {/* STEP 1 : UPLOAD */}
                  {activeStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex flex-col items-center justify-center h-full gap-6 p-8"
                    >
                      <div className="w-32 h-40 border-2 border-dashed border-emerald-500/30 rounded-xl flex items-center justify-center bg-emerald-500/5 relative group">
                        <motion.div
                          animate={{ y: [5, -5, 5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <FileText className="w-12 h-12 text-emerald-400" />
                        </motion.div>
                        <div className="absolute -right-2 -bottom-2 bg-emerald-500 text-emerald-950 text-xs font-bold px-2 py-1 rounded-md">
                          .PPTX
                        </div>
                      </div>
                      <div className="space-y-3 text-center w-full max-w-[200px]">
                        <div className="flex justify-between text-[10px] text-emerald-400 font-mono uppercase tracking-wider">
                          <span>Uploading</span>
                          <span>100%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full mx-auto overflow-hidden">
                          <motion.div
                            className="h-full bg-emerald-500"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2 : CONFIG */}
                  {activeStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="h-full flex flex-col p-6"
                    >
                      <div className="grid grid-cols-2 gap-4 h-full">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2 text-emerald-400 mb-1">
                            <Settings2 className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Style</span>
                          </div>
                          {styleOptions.map((opt) => (
                            <div key={opt.id} className={cn(
                              "p-3 rounded-xl border text-left flex flex-col gap-1 relative",
                              opt.active
                                ? "bg-emerald-500/10 border-emerald-500"
                                : "bg-white/5 border-white/5 opacity-60"
                            )}>
                              <div className="flex items-center justify-between">
                                <span className={cn("font-semibold text-xs", opt.active ? "text-emerald-300" : "text-white")}>
                                  {opt.label}
                                </span>
                                <div className={cn("w-3 h-3 rounded-full border flex items-center justify-center", opt.active ? "border-emerald-400" : "border-white/30")}>
                                  {opt.active && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                                </div>
                              </div>
                              <p className="text-[9px] text-neutral-400 leading-tight">{opt.desc}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2 text-emerald-400 mb-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Longueur</span>
                          </div>
                          {lengthOptions.map((opt) => (
                            <div key={opt.id} className={cn(
                              "p-3 rounded-xl border text-left flex flex-col gap-1 relative",
                              opt.active
                                ? "bg-emerald-500/10 border-emerald-500"
                                : "bg-white/5 border-white/5 opacity-60"
                            )}>
                              <div className="flex items-center justify-between">
                                <span className={cn("font-semibold text-xs", opt.active ? "text-emerald-300" : "text-white")}>
                                  {opt.label}
                                </span>
                                <div className={cn("w-3 h-3 rounded-full border flex items-center justify-center", opt.active ? "border-emerald-400" : "border-white/30")}>
                                  {opt.active && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                                </div>
                              </div>
                              <p className="text-[9px] text-neutral-400 leading-tight">{opt.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3 : DASHBOARD REPLICA (GÉNÉRIQUE) */}
                  {activeStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col p-4 gap-3"
                    >
                      {/* HEADER INTERNE SIMULÉ */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-white leading-none">Marketing_Strategy_2025.pptx</h4>
                          <div className="text-[10px] text-emerald-400/60 font-mono mt-1">Slide 1 sur 12</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-mono">
                            02:30
                          </div>
                          <div className="h-6 px-3 rounded bg-emerald-600 text-white text-[10px] font-bold flex items-center">
                            Présenter
                          </div>
                        </div>
                      </div>

                      {/* CORPS DU DASHBOARD */}
                      <div className="flex-1 flex gap-4 overflow-hidden">

                        {/* COLONNE GAUCHE : SLIDE (GÉNÉRIQUE) */}
                        <div className="flex-1 bg-white rounded-lg overflow-hidden relative flex group">
                          {/* Design de la slide */}
                          <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-900 p-6 flex flex-col justify-between relative">

                            {/* Header Slide */}
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20">
                                <Globe className="w-3 h-3 text-white" />
                                <span className="text-[8px] font-bold text-white tracking-wide">GLOBAL CORP</span>
                              </div>
                              <div className="text-[8px] text-white/50 font-mono">CONFIDENTIAL</div>
                            </div>

                            {/* Contenu Slide */}
                            <div>
                              <h1 className="text-3xl font-black text-white leading-[0.9] mb-3 tracking-tight">
                                STRATÉGIE<br />
                                <span className="text-emerald-200">CROISSANCE</span><br />
                                2025
                              </h1>
                              <div className="flex items-center gap-2">
                                <div className="h-1 w-8 bg-emerald-300 rounded-full" />
                                <p className="text-[9px] text-emerald-100 font-medium uppercase tracking-wider">
                                  Q4 Report Analysis
                                </p>
                              </div>
                            </div>

                            {/* Footer Slide */}
                            <div className="flex items-end justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-white/80 text-[8px]">
                                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center"><TrendingUp className="w-2.5 h-2.5" /></div>
                                  <span>+124% YoY Growth</span>
                                </div>
                              </div>
                              <div className="text-[20px] font-bold text-white/10 select-none">
                                01
                              </div>
                            </div>

                            {/* Formes décoratives fond */}
                            <div className="absolute right-0 top-1/4 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl" />
                            <div className="absolute left-0 bottom-0 w-full h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
                          </div>
                        </div>

                        {/* COLONNE DROITE : SCRIPT */}
                        <div className="w-[140px] bg-emerald-950/50 border border-emerald-500/10 rounded-lg flex flex-col overflow-hidden">

                          {/* Script Header */}
                          <div className="h-8 border-b border-white/5 flex items-center justify-between px-2 bg-white/5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-0.5 h-3 bg-emerald-500 rounded-full" />
                              <span className="text-[10px] font-bold text-white">Script</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="p-1 rounded hover:bg-white/10 text-emerald-400/70"><Settings2 className="w-3 h-3" /></div>
                              <div className="px-1.5 py-0.5 rounded border border-white/10 text-[8px] text-white/60 font-medium"><Edit className="w-3 h-3" /></div>
                            </div>
                          </div>

                          {/* Prompter Controls */}
                          <div className="h-8 border-b border-white/5 flex items-center justify-between px-2 bg-black/20">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                              </div>
                              <span className="text-[8px] font-bold text-emerald-500/50 uppercase tracking-wider">ON AIR</span>
                            </div>
                            <div className="flex items-center gap-1 bg-black/40 rounded px-1 py-0.5 border border-white/5">
                              <span className="text-[8px] text-white font-mono">1.0x</span>
                            </div>
                          </div>

                          {/* Script Text Content */}
                          <div className="flex-1 p-3 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-emerald-950 to-transparent z-10" />
                            <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-emerald-950 to-transparent z-10" />

                            <motion.div
                              className="space-y-3"
                              animate={{ y: [0, -40] }}
                              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            >
                              <p className="text-[9px] leading-relaxed text-emerald-100/90 font-medium">
                                <span className="text-emerald-500 font-bold">Mesdames, Messieurs, bonjour.</span> C'est un honneur de vous présenter nos résultats aujourd'hui.
                              </p>
                              <p className="text-[9px] leading-relaxed text-emerald-100/50">
                                Comme vous pouvez le constater sur cette première slide, l'année 2025 marque un tournant décisif.
                              </p>
                              <p className="text-[9px] leading-relaxed text-emerald-100/30">
                                Nous avons dépassé tous nos objectifs de croissance, consolidant ainsi notre position de leader.
                              </p>
                            </motion.div>
                          </div>

                        </div>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>

            {/* Glow effect */}
            <div className="absolute -inset-4 bg-emerald-500/20 blur-3xl -z-10 rounded-full opacity-50" />
          </div>

        </div>
      </div>
    </section>
  );
}