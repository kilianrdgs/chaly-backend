/**
 * Service d'envoi de SMS via TopMessage
 */

export interface SendSmsOptions {
  to: string;
  text: string;
}

export class SmsService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.topmessage.fr/v1/messages";
  private readonly timeoutMs = 5000;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Envoie un SMS
   */
  async send({ to, text }: SendSmsOptions): Promise<void> {
    try {
      // Créer un AbortController pour gérer le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "X-TopMessage-Key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            from: "Chaly",
            to: [to],
            text,
            shorten_URLs: false,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Aucune réponse");
        console.error(`Erreur API TopMessage [${response.status}]:`, errorText);

        throw new Error(
          `Le service SMS a retourné une erreur (${response.status})`
        );
      }

      const responseData = await response.json().catch(() => ({}));
      console.info("SMS envoyé avec succès:", responseData);
    } catch (error) {
      // Gestion spécifique des erreurs
      if (error instanceof Error) {
        // Erreur de timeout
        if (error.name === "AbortError") {
          console.error("Timeout lors de l'envoi du SMS");
          throw new Error("Timeout lors de l'envoi du SMS");
        }

        // Erreur réseau
        if (
          error.message.includes("fetch failed") ||
          error.message.includes("ENOTFOUND") ||
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("ETIMEDOUT")
        ) {
          console.error("Erreur réseau lors de l'envoi du SMS:", error.message);
          throw new Error("Erreur réseau lors de l'envoi du SMS");
        }
      }

      // Erreur inconnue
      console.error("Erreur inconnue lors de l'envoi du SMS:", error);
      throw error;
    }
  }

  /**
   * Envoie un code OTP par SMS
   */
  async sendOtp(phoneNumber: string, code: string): Promise<void> {
    return this.send({
      to: phoneNumber,
      text: `🎯 Ton code de connexion : ${code}`,
    });
  }
}
