import {
  SNSClient,
  CreatePlatformEndpointCommand,
  PublishCommand,
  GetEndpointAttributesCommand,
  SetEndpointAttributesCommand,
} from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: "eu-west-3" });
const platformApplicationArnIOS = process.env.SNS_PLATFORM_APPLICATION_ARN_IOS;
const platformApplicationArnAndroid = process.env.SNS_PLATFORM_APPLICATION_ARN_ANDROID;

// Détecte la plateforme basée sur le format du token
function detectPlatform(token: string): "ios" | "android" {
  // Les tokens iOS sont généralement en hexadécimal (64+ caractères)
  // Les tokens Android/FCM sont plus longs (152+ caractères) et contiennent des lettres et chiffres
  if (token.length > 140) {
    return "android";
  }
  return "ios";
}

// Crée ou récupère un endpoint SNS
async function getOrCreateEndpoint(
  platformApplicationArn: string,
  token: string
): Promise<string> {
  try {
    const endpointRes = await snsClient.send(
      new CreatePlatformEndpointCommand({
        PlatformApplicationArn: platformApplicationArn,
        Token: token,
      })
    );
    return endpointRes.EndpointArn!;
  } catch (error: any) {
    // Si l'endpoint existe déjà avec des attributs différents
    if (error.name === "InvalidParameterException") {
      const message = error.message || "";
      const arnMatch = message.match(/arn:aws:sns[^\s]+/);

      if (arnMatch) {
        const existingEndpointArn = arnMatch[0];
        console.log("📌 Endpoint existant trouvé:", existingEndpointArn);

        // Vérifier si l'endpoint est enabled
        const getAttrsRes = await snsClient.send(
          new GetEndpointAttributesCommand({
            EndpointArn: existingEndpointArn,
          })
        );

        const enabled = getAttrsRes.Attributes?.Enabled;
        const currentToken = getAttrsRes.Attributes?.Token;

        // Mettre à jour le token et réactiver si nécessaire
        if (enabled === "false" || currentToken !== token) {
          console.log("🔄 Mise à jour de l'endpoint...");
          await snsClient.send(
            new SetEndpointAttributesCommand({
              EndpointArn: existingEndpointArn,
              Attributes: {
                Token: token,
                Enabled: "true",
              },
            })
          );
        }

        return existingEndpointArn;
      }
    }
    throw error;
  }
}

export async function sendPush(
  token: string,
  title: string,
  body: string,
  postId?: number
) {
  const platform = detectPlatform(token);
  const platformApplicationArn = platform === "ios"
    ? platformApplicationArnIOS
    : platformApplicationArnAndroid;

  console.log(`📱 Plateforme détectée: ${platform.toUpperCase()}`);

  const endpointArn = await getOrCreateEndpoint(platformApplicationArn!, token);

  // Payload pour iOS (APNs)
  const apnsPayload = {
    aps: {
      alert: {
        title,
        body,
      },
      sound: "notif.caf", // Format .caf pour iOS
      badge: 0,
    },
    postId: postId ?? null,
  };

  // Payload pour Android (FCM/GCM)
  const gcmPayload = {
    notification: {
      title,
      body,
      sound: "notif.wav", // Format .wav pour Android
    },
    data: {
      postId: postId?.toString() ?? "",
    },
  };

  // Message multi-plateforme
  const message = {
    default: body, // Message par défaut (obligatoire)
    APNS: JSON.stringify(apnsPayload),
    APNS_SANDBOX: JSON.stringify(apnsPayload), // Pour dev iOS
    GCM: JSON.stringify(gcmPayload),
  };

  console.log("🚀 Envoi de la notification au endpoint ARN :", endpointArn);
  console.log(`📦 Payload ${platform.toUpperCase()}:`, platform === "ios" ? apnsPayload : gcmPayload);

  const res = await snsClient.send(
    new PublishCommand({
      TargetArn: endpointArn,
      Message: JSON.stringify(message),
      MessageStructure: "json",
    })
  );

  console.log("✅ Notification envoyée :", res.MessageId);
}
