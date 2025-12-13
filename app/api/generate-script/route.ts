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
async function generateWithFallback(systemPrompt: string, userPrompt: string, imageUrl?: string): Promise<string> {
  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`Tentative avec le modèle : ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      let result;

      if (imageUrl) {
        // Extraction des données de l'image (format data:image/jpeg;base64,...)
        const base64Data = imageUrl.split(',')[1];
        const mimeType = imageUrl.split(';')[0].split(':')[1];

        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        };

        result = await model.generateContent([
          systemPrompt + "\n\n" + userPrompt,
          imagePart
        ]);
      } else {
        result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
      }

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

/**
 * Génère le script pour une slide spécifique avec des règles strictes de formatage.
 */
async function generateScriptForSlide(
  text: string,
  config: ScriptConfig,
  slideNumber: number,
  totalSlides: number,
  imageUrl?: string | null
): Promise<string> {

  // 1. Définition des personnalités (System Prompt) avec TYPAGE EXPLICITE pour éviter l'erreur rouge
  const personas: Record<ScriptConfig['style'], string> = {
    simple: `Tu es un orateur chaleureux, accessible et enthousiaste. Tu t'adresses à un public grand public ou débutant. Ton objectif est de vulgariser, de raconter une histoire simple et d'être très proche de ton audience. Utilise un langage courant, "on" et "vous".`,
    normal: `Tu es un présentateur professionnel, confiant et clair. Tu t'adresses à des collègues ou des clients. Ton ton est équilibré : ni trop familier, ni trop rigide. Tu cherches à convaincre, informer et engager avec dynamisme.`,
    pro: `Tu es un expert de haut niveau, un dirigeant ou un conférencier stratégique. Tu t'adresses à un comité de direction, des investisseurs ou des experts. Ton ton est autoritaire, précis, analytique et sophistiqué. Utilise un vocabulaire riche et des tournures élégantes.`
  };

  // 2. Définition des contraintes de longueur avec TYPAGE EXPLICITE
  const lengthConstraints: Record<ScriptConfig['length'], string> = {
    court: `Génère un "Elevator Pitch". Va droit au but. Ne retiens que l'idée maîtresse (le "Key Takeaway"). Maximum 3 phrases percutantes. Sois incisif.`,
    moyen: `Génère un discours standard et équilibré (environ 45 secondes à l'oral). Présente les points principaux de la slide en les liant logiquement.`,
    long: `Génère une analyse approfondie et détaillée. Prends le temps de décortiquer chaque élément, d'expliquer le "pourquoi" et le "comment". Fais des liens avec le contexte global.`
  };

  // 3. Gestion intelligente de la structure (Début / Milieu / Fin)
  let structureInstruction = "";

  if (slideNumber === 1) {
    // PREMIÈRE SLIDE : Introduction obligatoire
    if (config.style === 'simple') {
      structureInstruction = `Ceci est la TOUTE PREMIÈRE slide. Tu DOIS OBLIGATOIREMENT commencer par une phrase de bienvenue chaleureuse (ex: "Bonjour tout le monde, ravi d'être avec vous..."). Ensuite, introduis le sujet.`;
    } else if (config.style === 'pro') {
      structureInstruction = `Ceci est la TOUTE PREMIÈRE slide. Tu DOIS OBLIGATOIREMENT commencer par une salutation formelle et poser le cadre stratégique de la présentation.`;
    } else {
      structureInstruction = `Ceci est la TOUTE PREMIÈRE slide. Commence par "Bonjour à toutes et à tous", présente le titre et l'objectif de la présentation.`;
    }
  } else if (slideNumber === totalSlides) {
    // DERNIÈRE SLIDE : Conclusion obligatoire
    structureInstruction = `Ceci est la DERNIÈRE slide. Résume brièvement le point clé, puis termine par une phrase de clôture forte et remercie l'audience pour son attention. Ne laisse pas le discours en suspens.`;
  } else {
    // SLIDES INTERMÉDIAIRES : Transition fluide
    structureInstruction = `Ceci est la slide numéro ${slideNumber} sur ${totalSlides}. NE DIS PAS "BONJOUR". Commence directement par une transition fluide (ex: "Ce qui nous amène à...", "Par ailleurs...", "Analysons maintenant...") qui lie l'idée précédente à celle-ci.`;
  }

  // 4. Construction du System Prompt (Le "Cerveau")
  const systemPrompt = `
    ${personas[config.style]}

    RÈGLES ABSOLUES DE FORMATAGE (MODE TÉLÉPROMPTEUR) :
    1.  INTERDIT : Ne jamais utiliser de tirets (-), de puces (•) ou de deux-points (:) pour faire des listes.
    2.  INTERDIT : Ne jamais écrire "Slide suivante", "Titre :", ou "Script :".
    3.  INTERDIT : Ne laisse aucune instruction entre parenthèses comme (Pause) ou (Rires). Écris uniquement le texte parlé.
    4.  OBLIGATOIRE : Écris un texte fluide et continu, rédigé entièrement en phrases complètes (Sujet + Verbe + Complément).
    5.  OBLIGATOIRE : Si le texte source est une liste à puces, transforme-la en prose (ex: au lieu de "- A - B", dis "Premièrement nous avons A, et ensuite nous voyons B").
    6.  OBLIGATOIRE : Utilise la ponctuation orale (!, ?, ...) pour marquer le rythme.
    7. INTERDIT : N'utilise pas de deux-points (:) au milieu d'une phrase. Remplace-les par des points (.) ou des mots de liaison comme "c'est-à-dire" ou "car".
  `;

  // 5. Construction du User Prompt (La "Mission")
  let userPrompt = `
    CONTEXTE DE LA MISSION :
    - Slide actuelle : ${slideNumber} / ${totalSlides}
    - Instruction de structure : ${structureInstruction}
    - Longueur et densité : ${lengthConstraints[config.length]}
    
    CONTENU À TRANSFORMER EN DISCOURS :
    Voici le texte brut extrait de la slide : "${text}"
  `;

  if (imageUrl) {
    userPrompt += `
    Une image de la slide est fournie en pièce jointe. 
    IMPORTANT : Analyse cette image. Si elle contient un graphique, des chiffres clés ou une photo pertinente, intègre leur description dans ton discours pour le rendre vivant (ex: "Comme vous pouvez le voir sur ce graphique...").
    `;
  }

  userPrompt += `
    Génère maintenant le script exact à prononcer, mot pour mot.
  `;

  // Appel avec la logique de fallback
  try {
    return await generateWithFallback(systemPrompt, userPrompt, imageUrl || undefined);
  } catch (error) {
    console.error("Erreur fatale lors de la génération :", error);
    return "Mesdames, Messieurs, une erreur technique m'empêche de commenter cette diapositive spécifique. Passons à la suite.";
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

    // Utilisation d'une boucle séquentielle pour éviter de saturer la DB et l'API
    for (const slide of presentation.slides) {
      try {
        // 1. Génération du script avec l'IA
        const generatedScript = await generateScriptForSlide(
          slide.extractedText || 'Cette slide est principalement visuelle ou ne contient pas de texte.',
          config,
          slide.slideNumber,
          totalSlides,
          slide.imageUrl // Passage de l'image
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