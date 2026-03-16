import { RequestHandler } from "express";
import {
  SNSClient,
  CreatePlatformEndpointCommand,
  GetEndpointAttributesCommand,
  SetEndpointAttributesCommand,
  PublishCommand,
} from "@aws-sdk/client-sns";
import { NodeHttpHandler } from "@smithy/node-http-handler";

export function testController(): RequestHandler {
  return async (_req, res) => {
    const sns = new SNSClient({
      region: "eu-west-3",
      maxAttempts: 2,
      requestHandler: new NodeHttpHandler({
        connectionTimeout: 3000,
        requestTimeout: 3000,
      }),
    });

    const deviceToken =
      "01899b416d77fc1fa24bdd43b268b0cfb20213a071f5aa7858b6a009cc93e173";
    const platformApplicationArn =
      "arn:aws:sns:eu-west-3:762233728636:app/APNS/chaly_ios";

    let endpointArn: string;

    try {
      // Étape 1 : Tente de créer un endpoint
      try {
        const createRes = await sns.send(
          new CreatePlatformEndpointCommand({
            PlatformApplicationArn: platformApplicationArn,
            Token: deviceToken,
          })
        );
        endpointArn = createRes.EndpointArn!;
        console.log("✅ Endpoint SNS créé :", endpointArn);
      } catch (createErr: any) {
        // Si erreur d'existence : on extrait l'ARN existant
        if (
          createErr.name === "InvalidParameterException" &&
          createErr.message.includes("already exists")
        ) {
          const match = createErr.message.match(
            /Endpoint (arn:aws:sns[^ ]+) already exists/
          );
          if (match && match[1]) {
            endpointArn = match[1];
            console.warn("⚠️ Endpoint déjà existant, réutilisé :", endpointArn);
          } else {
            throw createErr;
          }
        } else {
          throw createErr;
        }
      }

      // Étape 2 (optionnel) : s'assurer qu’il est bien "Enabled"
      const attrRes = await sns.send(
        new GetEndpointAttributesCommand({
          EndpointArn: endpointArn,
        })
      );

      if (attrRes.Attributes?.Enabled !== "true") {
        console.log("🔄 Activation de l'endpoint SNS...");
        await sns.send(
          new SetEndpointAttributesCommand({
            EndpointArn: endpointArn,
            Attributes: {
              Enabled: "true",
            },
          })
        );
      }

      // Étape 3 : construire le payload APNS
      const apnsPayload = {
        aps: {
          alert: {
            title: "🚀 SNS Push Test",
            body: "Push envoyé même si endpoint déjà existant 😎",
          },
          sound: "default",
          badge: 1,
        },
      };

      const messagePayload = {
        APNS: JSON.stringify(apnsPayload),
      };

      // Étape 4 : envoyer le message
      const publishRes = await sns.send(
        new PublishCommand({
          TargetArn: endpointArn,
          MessageStructure: "json",
          Message: JSON.stringify(messagePayload),
        })
      );

      console.log("✅ Notif envoyée :", publishRes.MessageId);
      res.json({
        success: true,
        messageId: publishRes.MessageId,
        endpointArn,
      });
    } catch (err: any) {
      console.error("❌ Erreur finale SNS :", err);
      res.status(500).json({
        success: false,
        message: err.message,
        name: err.name,
        code: err.code,
      });
    }
  };
}
