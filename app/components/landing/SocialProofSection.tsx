"use client";

import React from "react";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { Apple } from "lucide-react";

// La liste complète des utilisateurs exemples
const users = [
  {
    id: 1,
    name: "Alex Durand",
    designation: "Chef de Projet",
    image:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80",
  },
  {
    id: 2,
    name: "Léa Martin",
    designation: "Marketing Manager",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 3,
    name: "Samir Khelif",
    designation: "Développeur Full-Stack",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
  },
    {
    id: 4,
    name: "Chloé Dubois",
    designation: "UX Designer",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 5,
    name: "Marc Petit",
    designation: "Entrepreneur",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80",
  },
];

export function SocialProofSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });

  return (
    <section ref={ref} className="w-full bg-emerald-950 py-24 sm:py-32">
      <div className="container mx-auto flex flex-col items-center text-center gap-8">
        <div className="flex flex-row items-center justify-center">
          <AnimatedTooltip items={users} />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white">
          Approuvé par +
          {inView && (
            <CountUp
              start={0}
              end={1200}
              duration={2}
              separator=","
            />
          )}
          utilisateurs
        </h2>
        <Button asChild size="lg" className="bg-white text-emerald-950 hover:bg-neutral-200 rounded-full px-6 font-semibold">
          <Link href="/generate">
            <Apple className="mr-2 h-5 w-5" />
            Commencer gratuitement
          </Link>
        </Button>
      </div>
    </section>
  );
}