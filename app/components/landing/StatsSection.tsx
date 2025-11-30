"use client";

import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import { BrainCircuit, Hourglass, BarChart } from 'lucide-react';
import React from 'react'; // Import React

// ✅ CORRECTION : On stocke le composant lui-même, pas un élément JSX
const stats = [
  {
    IconComponent: BrainCircuit, // On stocke le composant, pas <BrainCircuit />
    value: 543821,
    prefix: "+",
    suffix: "",
    label: "Mots générés par l'IA",
  },
  {
    IconComponent: Hourglass,
    value: 17392,
    prefix: "+",
    suffix: "h",
    label: "Heures de préparation économisées",
  },
  {
    IconComponent: BarChart,
    value: 843,
    prefix: "$",
    suffix: "k+",
    label: "De gains en productivité",
  },
];

export function StatsSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <section ref={ref} className="bg-emerald-950 antialiased bg-grid-white/[0.05] w-full py-24 sm:py-32">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              {/* ✅ CORRECTION : On crée l'icône ici avec les bonnes classes */}
              <stat.IconComponent className="h-10 w-10 text-emerald-400" />
              <h2 className="text-5xl md:text-6xl font-bold text-white mt-4">
                {inView && (
                  <CountUp
                    start={0}
                    end={stat.value}
                    duration={2.5}
                    separator=","
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                )}
              </h2>
              <p className="mt-2 text-base text-neutral-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}