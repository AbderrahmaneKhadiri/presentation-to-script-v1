import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { ScriptConfig } from '@/app/generate/page';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

// Initialisation du Rate Limiter (5 requêtes par 10 minutes)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
});

// Liste des modèles à tester par ordre de priorité
const MODELS_TO_TRY = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash'
];

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('La variable GEMINI_API_KEY est manquante.');

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Tente de générer du contenu en essayant plusieurs modèles Gemini successivement.
 */
async function generateWithFallback(systemPrompt: string, userPrompt: string): Promise<string> {
  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`Tentative avec le modèle : ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
      const response = await result.response;
      const text = response.text();

      if (text) {
        console.log(`✅ Succès avec ${modelName}`);
        return text;
      }
    } catch (error: any) {
      console.warn(`❌ Échec avec ${modelName} : ${error.message}`);
      lastError = error;
    }
  }

  throw new Error(`Tous les modèles ont échoué. Dernière erreur : ${lastError?.message}`);
}

async function generateScriptForSlide(
  text: string,
  config: ScriptConfig,
  slideNumber: number,
  totalSlides: number
): Promise<string> {
  const styleInstruction = {
    simple: "un style simple, direct et facile à comprendre.",
    normal: "un style engageant, conversationnel et professionnel.",
    pro: "un style très professionnel, détaillé, avec des arguments solides et un vocabulaire soutenu.",
  };

  const lengthInstruction = {
    court: "Le script doit être concis (environ 50 mots).",
    moyen: "Le script doit avoir une longueur standard (environ 120 mots).",
    long: "Le script doit être détaillé (environ 200 mots).",
  };

  // ===== PROMPT SYSTÈME =====
  const systemPrompt = `Tu es un coach expert en art oratoire. Ta mission est de rédiger un script percutant pour une slide SPÉCIFIQUE au sein d'une présentation complète. Ne te présente pas et ne commence pas chaque slide par "Bonjour". Tu dois créer une continuité entre les slides.`;

  // Instruction de position
  let positionInstruction = "C'est une slide intermédiaire. Commence par une transition fluide depuis la slide précédente et termine en introduisant la suivante.";
  if (slideNumber === 1) {
    positionInstruction = "C'est la toute première slide. Commence par une phrase d'accroche pour introduire le sujet de la présentation, puis présente le contenu de cette slide.";
  } else if (slideNumber === totalSlides) {
    positionInstruction = "C'est la dernière slide. Fais une transition depuis la slide précédente, présente le contenu de cette slide, puis termine par une conclusion générale forte pour toute la présentation.";
  }

  // ===== PROMPT UTILISATEUR =====
  const userPrompt = `
Voici les détails de la slide à traiter :
- Contexte : Tu rédiges le script pour la slide ${slideNumber} sur un total de ${totalSlides}.
- Instruction de position : ${positionInstruction}
- Texte brut de la slide : "${text}"
- Style demandé : ${styleInstruction[config.style]}
- Longueur demandée : ${lengthInstruction[config.length]}

RAPPEL : Ne retourne QUE le script à prononcer, sans aucun titre ni commentaire.`;

  // Appel avec la logique de fallback (Test des modèles configurés)
  try {
    return await generateWithFallback(systemPrompt, userPrompt);
  } catch (error) {
    console.error("Erreur fatale lors de la génération :", error);
    return "Désolé, la génération a échoué pour cette slide malgré plusieurs tentatives.";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
    }

    // Vérification du Rate Limit
    const { success } = await ratelimit.limit(userId);
    if (!success) {
      return NextResponse.json({ error: 'Trop de requêtes. Veuillez réessayer plus tard.' }, { status: 429 });
    }

    const { presentationId, config } = await req.json();

    if (!presentationId || !config) {
      return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });
    }

    const presentation = await prisma.presentation.findUnique({
      where: { id: presentationId },
      include: { slides: { orderBy: { slideNumber: 'asc' } } },
    });

    if (!presentation) {
      return NextResponse.json({ error: 'Présentation non trouvée.' }, { status: 404 });
    }

    const totalSlides = presentation.slides.length;

    // MODIFICATION ICI : Utilisation d'une boucle séquentielle pour éviter de saturer la DB
    for (const slide of presentation.slides) {
      try {
        // 1. Génération du script avec l'IA
        const generatedScript = await generateScriptForSlide(
          slide.extractedText || 'Cette slide est principalement visuelle ou ne contient pas de texte.',
          config,
          slide.slideNumber,
          totalSlides
        );

        // 2. Détermination du champ à mettre à jour
        let fieldToUpdate: 'scriptSimple' | 'scriptMedium' | 'scriptPro' = 'scriptMedium';
        if (config.style === 'simple') fieldToUpdate = 'scriptSimple';
        if (config.style === 'pro') fieldToUpdate = 'scriptPro';

        // 3. Mise à jour séquentielle dans la base de données
        await prisma.slide.update({
          where: { id: slide.id },
          data: { [fieldToUpdate]: generatedScript },
        });
      } catch (slideError) {
        console.error(`Erreur lors du traitement de la slide ${slide.slideNumber}:`, slideError);
        // On continue la boucle même si une slide échoue pour ne pas tout bloquer
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Erreur globale API:", error);
    return NextResponse.json({ error: `Erreur serveur: ${error.message}` }, { status: 500 });
  }
}