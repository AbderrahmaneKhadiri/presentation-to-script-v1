"use client";

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import type { ScriptConfig } from '@/app/generate/page';
import { cn } from '@/lib/utils';
import { Sparkles, Clock, Mic } from 'lucide-react';

type Props = {
  config: ScriptConfig;
  setConfig: (config: ScriptConfig) => void;
  onSubmit: () => void;
};

export function Step2Config({ config, setConfig, onSubmit }: Props) {
  return (
    <div className="max-w-5xl mx-auto">

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
          <span className="font-mono font-bold">2</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Configurez votre script</h2>
        <p className="text-emerald-100/60 mt-2">Personnalisez le ton et la longueur de votre discours.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Carte pour le Style */}
        <div className="bg-emerald-950/30 backdrop-blur-xl border border-emerald-500/10 rounded-3xl p-8 shadow-xl">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Mic className="w-5 h-5 text-emerald-400" />
            Style du discours
          </h3>
          <RadioGroup
            value={config.style}
            onValueChange={(value) => setConfig({ ...config, style: value as ScriptConfig['style'] })}
            className="space-y-4"
          >
            <SelectionCard
              value="simple"
              id="simple"
              title="Simple et direct"
              description="Phrases courtes, vocabulaire accessible. Idéal pour aller droit au but."
              currentValue={config.style}
            />
            <SelectionCard
              value="normal"
              id="normal"
              title="Normal et engageant"
              description="Équilibré, avec des questions rhétoriques et du storytelling."
              currentValue={config.style}
            />
            <SelectionCard
              value="pro"
              id="pro"
              title="Professionnel et détaillé"
              description="Vocabulaire technique, structure formelle et analyses approfondies."
              currentValue={config.style}
            />
          </RadioGroup>
        </div>

        {/* Carte pour la Longueur */}
        <div className="bg-emerald-950/30 backdrop-blur-xl border border-emerald-500/10 rounded-3xl p-8 shadow-xl flex flex-col">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Longueur estimée
          </h3>
          <RadioGroup
            value={config.length}
            onValueChange={(value) => setConfig({ ...config, length: value as ScriptConfig['length'] })}
            className="space-y-4 flex-1"
          >
            <SelectionCard
              value="court"
              id="court"
              title="Court (~1 min / slide)"
              description="L'essentiel en quelques mots."
              currentValue={config.length}
            />
            <SelectionCard
              value="moyen"
              id="moyen"
              title="Moyen (~2 min / slide)"
              description="Le format standard pour présenter."
              currentValue={config.length}
            />
            <SelectionCard
              value="long"
              id="long"
              title="Long (~3+ min / slide)"
              description="Pour des explications très détaillées."
              currentValue={config.length}
            />
          </RadioGroup>
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <Button
          onClick={onSubmit}
          size="lg"
          className="bg-emerald-600 text-white hover:bg-emerald-500 font-bold text-lg px-12 py-8 rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300 w-full md:w-auto border border-emerald-400/20"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Générer mon script maintenant
        </Button>
      </div>
    </div>
  );
}

function SelectionCard({ value, id, title, description, currentValue }: { value: string, id: string, title: string, description: string, currentValue: string }) {
  const isSelected = currentValue === value;
  return (
    <Label
      htmlFor={id}
      className={cn(
        "relative flex items-start space-x-4 p-5 rounded-xl border cursor-pointer transition-all duration-200 group",
        isSelected
          ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
          : "bg-emerald-950/50 border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-500/5"
      )}
    >
      <RadioGroupItem value={value} id={id} className="mt-1 border-emerald-400 text-emerald-500" />
      <div className="flex-1">
        <p className={cn("font-semibold text-lg transition-colors", isSelected ? "text-emerald-300" : "text-white group-hover:text-emerald-100")}>
          {title}
        </p>
        <p className="text-sm text-emerald-100/50 mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </Label>
  );
}