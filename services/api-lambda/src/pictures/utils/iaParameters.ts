import { aiStyles } from "./styles";

export type Language = "fr" | "en" | "es" | "pt";

const languageNames: Record<Language, string> = {
	fr: "français",
	en: "anglais",
	es: "espagnol",
	pt: "portugais",
};

// Cette section est deprecated - gardée pour compatibilité mais non utilisée

// ============================================
// PROMPTS POUR BEDROCK (Nova + Mistral)
// ============================================

/**
 * Génère le prompt pour Nova (analyse factuelle de l'image)
 */
export const getNovaPrompt = (language: Language = "fr"): string => {
	const langName = languageNames[language];
	return `Décris précisément cette image en ${langName}, sans interprétation ni opinion. Sois factuel et exhaustif.`;
};

// Style unique de l'application

/**
 * Génère le prompt pour Mistral (styling avec le style unique de l'app)
 */
export const getMistralPrompt = (
	novaOutput: string,
	challenge?: string | null,
	language: Language = "fr",
	personalityMode = "default",
): string => {
	const langName = languageNames[language];

	// Sélectionner le style en fonction du PersonalityMode
	const selectedStyle =
		aiStyles[personalityMode as keyof typeof aiStyles] || aiStyles.default;

	const challengeField = challenge ? `,\n  "challengeRespected": true` : "";

	return `Voici une description factuelle d'une image :

${novaOutput}

À partir de cette description, rédige un JSON **valide**:
{
  "title": "un titre de 3–4 mots avec emojis",
  "description": "une phrase (<=15 mots) avec emojis"${challengeField}
}

Règles :
- ${langName} uniquement.
- Style : ${selectedStyle}.
- Réponds uniquement avec le JSON.
- Ne renvoie **aucun texte hors du JSON**.`;
};
