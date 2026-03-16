import { aiStyles } from "./styles";

export type Language = "fr" | "en" | "es" | "pt";

const languageNames: Record<Language, string> = {
  fr: "français",
  en: "anglais",
  es: "espagnol",
  pt: "portugais",
};

/**
 * Génère le prompt pour le vision stage (analyse factuelle de l'image)
 */
export const getVisionStagePrompt = (language: Language = "fr"): string => {
  const langName = languageNames[language];
  return `Décris précisément cette image en ${langName}, sans interprétation ni opinion. Sois factuel et exhaustif.`;
};

/**
 * Génère le prompt pour le reasoning stage (styling avec le style unique de l'app)
 */
export const getReasoningStagePrompt = (
  visionStageOutput: string,
  challenge?: string | null,
  language: Language = "fr",
  personalityMode = "default",
  city?: string | null
): string => {
  const langName = languageNames[language];

  // Sélectionner le style en fonction du PersonalityMode
  const selectedStyle =
    aiStyles[personalityMode as keyof typeof aiStyles] || aiStyles.default;

  const challengeField = challenge ? `,\n  "challengeRespected": true` : "";

  // Ajouter une instruction sur la ville si disponible
  const cityInstruction = city
    ? `\n- Si pertinent, fais une référence subtile ou un jeu de mots sur la ville de ${city}.`
    : "";

  return `Voici une description factuelle d'une image :

${visionStageOutput}

À partir de cette description, rédige un JSON **valide**:
{
  "titles": [
    "titre court (3–4 mots max, avec emojis)",
    "titre court (3–4 mots max, avec emojis)",
    "titre court (3–4 mots max, avec emojis)"
  ],
  "description": "une phrase (<=15 mots) avec emojis"${challengeField}
}

Règles :
- ${langName} uniquement.
- Donne **3 titres distincts**, maximum 4 mots chacun.
- Style : ${selectedStyle}.${cityInstruction}
- Réponds uniquement avec le JSON.
- Ne renvoie **aucun texte hors du JSON**.`;
};
