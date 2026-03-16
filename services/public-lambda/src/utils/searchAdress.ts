import {
  LocationClient,
  SearchPlaceIndexForPositionCommand,
} from "@aws-sdk/client-location";

const locationClient = new LocationClient({
  region: "eu-west-1", // Irlande
});

const PLACE_INDEX_NAME = "chaly-index";

/**
 * R�cup�re l'adresse (ville) � partir de coordonn�es GPS via AWS Location Service
 * @param latitude - Latitude GPS
 * @param longitude - Longitude GPS
 * @returns L'adresse trouv�e ou null si erreur
 */
export async function searchAddressFromCoordinates(
  longitude: number,
  latitude: number
) {
  try {
    console.log(
      `<
 [searchAddressFromCoordinates] Recherche pour: ${latitude}, ${longitude}`
    );

    const command = new SearchPlaceIndexForPositionCommand({
      IndexName: PLACE_INDEX_NAME,
      Position: [latitude, longitude],
      MaxResults: 1,
      Language: "fr",
    });

    const response = await locationClient.send(command);

    if (!response.Results || response.Results.length === 0) {
      console.warn("� Aucun r�sultat trouv� pour ces coordonn�es");
      return null;
    }

    const place = response.Results[0].Place;

    return {
      city: place?.Municipality || "Ville inconnue",
      country: place?.Country,
    };
  } catch (error) {
    console.error("❌ [searchAddressFromCoordinates] Erreur complète:", {
      message: error instanceof Error ? error.message : error,
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : undefined,
      fullError: error,
    });
    return null;
  }
}
