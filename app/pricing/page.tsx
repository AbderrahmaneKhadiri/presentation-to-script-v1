"use client";

import { Sidebar } from "@/app/components/Sidebar";
import { Check, X, Zap, Crown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PricingPage() {
    return (
        <div className="flex h-screen bg-emerald-950 overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto max-w-5xl px-4 pt-24 pb-12 h-full flex flex-col justify-center">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                            Passez au niveau <span className="text-emerald-400">Supérieur</span>
                        </h1>
                        <p className="text-emerald-100/60 text-base max-w-2xl mx-auto">
                            Débloquez tout le potentiel de Presenter's CoPilot avec nos offres premium.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">

                        {/* Free Plan */}
                        <div className="bg-emerald-900/20 border border-emerald-500/10 rounded-2xl p-6 flex flex-col relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-emerald-100 mb-1">Gratuit</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">0€</span>
                                    <span className="text-emerald-200/60 text-sm">/mois</span>
                                </div>
                                <p className="text-emerald-200/40 text-xs mt-2">
                                    Parfait pour découvrir l'outil.
                                </p>
                            </div>

                            <div className="space-y-3 mb-6 flex-1">
                                <FeatureItem text="10 Crédits offerts" included={true} />
                                <FeatureItem text="Scripts courts uniquement" included={true} />
                                <FeatureItem text="Export PDF basique" included={true} />
                                <FeatureItem text="Support communautaire" included={true} />
                                <FeatureItem text="Génération illimitée" included={false} />
                                <FeatureItem text="Scripts longs & détaillés" included={false} />
                                <FeatureItem text="Mode Pro" included={false} />
                            </div>

                            <button className="w-full py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 cursor-not-allowed opacity-70 text-sm">
                                Plan Actuel
                            </button>
                        </div>

                        {/* Premium Plan */}
                        <div className="bg-gradient-to-b from-emerald-900/40 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 flex flex-col relative overflow-hidden group hover:border-emerald-400/50 transition-all duration-300 shadow-2xl shadow-emerald-900/20">

                            {/* Popular Badge */}
                            <div className="absolute top-0 right-0 bg-emerald-500 text-emerald-950 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                                POPULAIRE
                            </div>

                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-semibold text-white">Premium</h3>
                                    <Crown className="h-4 w-4 text-yellow-400" />
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">19€</span>
                                    <span className="text-emerald-200/60 text-sm">/mois</span>
                                </div>
                                <p className="text-emerald-200/60 text-xs mt-2">
                                    Pour les professionnels exigeants.
                                </p>
                            </div>

                            <div className="space-y-3 mb-6 flex-1">
                                <FeatureItem text="Crédits illimités" included={true} highlight={true} />
                                <FeatureItem text="Tous les styles de scripts" included={true} />
                                <FeatureItem text="Scripts longs & détaillés" included={true} />
                                <FeatureItem text="Export Word & PDF" included={true} />
                                <FeatureItem text="Support prioritaire" included={true} />
                                <FeatureItem text="Accès aux nouvelles fonctionnalités" included={true} />
                            </div>

                            <Link
                                href="#"
                                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-center transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] text-sm"
                            >
                                Passer Premium
                            </Link>
                        </div>

                    </div>

                    {/* FAQ or Trust Section could go here */}
                    <div className="mt-8 text-center">
                        <p className="text-emerald-200/40 text-xs">
                            Paiement sécurisé via Stripe. Annulation possible à tout moment.
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
}

function FeatureItem({ text, included, highlight = false }: { text: string, included: boolean, highlight?: boolean }) {
    return (
        <div className="flex items-center gap-3">
            {included ? (
                <div className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0",
                    highlight ? "bg-emerald-500 text-emerald-950" : "bg-emerald-500/20 text-emerald-400"
                )}>
                    <Check className="h-3 w-3" />
                </div>
            ) : (
                <div className="h-5 w-5 rounded-full bg-emerald-900/20 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <X className="h-3 w-3" />
                </div>
            )}
            <span className={cn(
                "text-sm",
                included ? "text-emerald-100" : "text-emerald-200/30 line-through",
                highlight && "font-semibold text-white"
            )}>
                {text}
            </span>
        </div>
    );
}