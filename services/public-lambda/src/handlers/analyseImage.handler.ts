import type { Context } from "hono";
import CustomError from "../utils/customError";
import PicturesService from "../pictures/services/picture.service";
import { searchAddressFromCoordinates } from "../utils/searchAdress";

const picturesService = new PicturesService();

/**
 * Handler pour analyser une image avec vision stage + reasoning stage
 * Route: POST /pictures/analyse
 */
export const analyseImageHandler = async (c: Context) => {
  console.log("[analyseImageHandler] Début de l'analyse de l'image");

  try {
    // 🔹 Récupérer le form-data
    const form = await c.req.formData();
    const file = form.get("media") as File | null;

    // 🔹 Récupérer latitude et longitude
    const latitude = parseFloat(form.get("latitude") as string);
    const longitude = parseFloat(form.get("longitude") as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      return c.json({ error: "Latitude or longitude is invalid" }, 400);
    }

    const response = await searchAddressFromCoordinates(longitude, latitude);

    console.log(response?.city);

    // 🔹 Vérifier que le fichier existe
    if (!file) {
      return c.json({ error: "media incorrect" }, 400);
    }

    // 🔹 Convertir le fichier en Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log(
      `📊 Poids de l'image: ${(buffer.length / 1024).toFixed(2)} KB (${
        buffer.length
      } bytes)`
    );

    // 🔹 Récupérer les paramètres optionnels
    const challenge = c.req.query("challenge") ?? null;
    const language = c.req.query("language") ?? "fr";

    // 🔹 Mode de personnalité
    const personalityMode = c.req.query("personnality") ?? "default";

    // 🔹 Analyse de l'image
    const result = await picturesService.analyse(
      buffer,
      file.type,
      challenge,
      language,
      personalityMode,
      response?.city
    );

    // 🔹 Gestion des erreurs custom
    if (result instanceof CustomError) {
      c.status(result.StatusCode as any);
      return c.json({ error: result.Message });
    }

    return c.json({
      ...result,
      location: response?.city || null,
    });
  } catch (err) {
    console.error("[analyseImageHandler] Erreur:", err);
    return c.json({ error: "Oups, le tonton a buggé 🧨" }, 500);
  }
};
