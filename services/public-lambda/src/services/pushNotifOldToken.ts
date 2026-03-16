import { oldTokens } from "../utils/oldTokens.js";

export async function sendPushOldTokens() {
  const messages = oldTokens
    .filter((token) => token.startsWith("ExponentPushToken["))
    .map((token) => ({
      to: token,
      sound: "default",
      title: "🔄 Mets à jour l'app",
      body: "Ouvre l'app pour réactiver les notifications !",
      data: {},
    }));

  console.log(`📤 Envoi de ${messages.length} notifications à ${oldTokens.length} tokens`);
  console.log("🔑 Premiers tokens:", oldTokens.slice(0, 3));

  const chunks = chunkArray(messages, 100); // Expo limite : 100 messages max par requête

  for (const chunk of chunks) {
    try {
      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chunk),
      });

      const data = await res.json();
      console.log("✅ Push envoyé à", chunk.length, "utilisateurs");
      console.log("📊 Status:", res.status);
      console.log("📦 Réponse complète:", JSON.stringify(data, null, 2));

      // Vérifier les erreurs dans la réponse
      if (data.data) {
        data.data.forEach((result: any, index: number) => {
          if (result.status === "error") {
            console.error(`❌ Erreur pour le token ${index}:`, result.message, result.details);
          }
        });
      }
    } catch (err) {
      console.error("❌ Erreur d’envoi :", err);
    }
  }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
