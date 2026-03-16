import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function checkUserPostPermissionRepo(
  userId: number
): Promise<boolean | CustomError> {
  try {
    const user = await prisma.users.findUnique({
      where: { Id: userId },
      select: { CanPost: true },
    });

    if (!user) {
      return new CustomError("Utilisateur non trouvé", StatusCodeEnum.NotFound);
    }

    if (!user.CanPost) {
      return new CustomError(
        "Vous n'avez pas l'autorisation de poster",
        StatusCodeEnum.Unauthorized
      );
    }

    return true;
  } catch (error) {
    console.error(
      "Erreur lors de la vérification du droit de poster. Erreur:",
      error
    );
    return new CustomError(
      "Erreur lors de la vérification du droit de poster.",
      StatusCodeEnum.InternalServerError
    );
  }
}
