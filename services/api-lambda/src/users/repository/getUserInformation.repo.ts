import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import type { UserDto } from "../service/models/userDto";
import { calculateLevel } from "../../utils/level";

export async function getUserInformationRepo(id: number) {
  try {
    const user = await prisma.users.findUnique({
      where: { Id: id },
      select: {
        Pseudo: true,
        PhoneNumber: true,
        PhotoUrl: true,
        XpTotal: true,
        IsVerified: true,
        IsCertified: true,
        Description: true,
        BackgroundName: true,
        Moderator: true,
        CanPost: true,
      },
    });

    if (user) {
      const levelInfo = calculateLevel(user.XpTotal);

      return {
        Id: id,
        Pseudo: user.Pseudo || "",
        PhotoUrl: user.PhotoUrl,
        IsVerified: user.IsVerified,
        IsCertified: user.IsCertified ?? false,
        Description: user.Description ?? null,
        BackgroundName: user.BackgroundName ?? null,
        Moderator: user.Moderator,
        levelInfo: levelInfo,
        CanPost: user.CanPost,
      };
    }
    return new CustomError(
      "Pas d'utilisateur pour l'id donné",
      StatusCodeEnum.NoContent
    );
  } catch (error) {
    console.error("Erreur lors de la récupération du user. Erreur:", error);
    return new CustomError(
      "Erreur lors de la récupération du user.",
      StatusCodeEnum.InternalServerError
    );
  }
}
