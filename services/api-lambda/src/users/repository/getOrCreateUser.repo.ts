import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import type { UserDto } from "../service/models/userDto";
import { calculateLevel } from "../../utils/level";

export async function getOrCreateUserRepo(phoneNumber: string) {
  try {
    // 1. Chercher l'utilisateur existant
    const existingUser = await prisma.users.findUnique({
      where: { PhoneNumber: phoneNumber },
      select: {
        Id: true,
        Pseudo: true,
        PhoneNumber: true,
        PhotoUrl: true,
        XpTotal: true,
        IsVerified: true,
        IsCertified: true,
        Description: true,
        BackgroundName: true,
        Moderator: true,
      },
    });

    if (existingUser) {
      const levelInfo = calculateLevel(existingUser.XpTotal);

      return {
        user: {
          Id: existingUser.Id,
          Pseudo: existingUser.Pseudo ?? null,
          PhotoUrl: existingUser.PhotoUrl,
          IsVerified: existingUser.IsVerified,
          IsCertified: existingUser.IsCertified || false,
          Description: existingUser.Description ?? null,
          BackgroundName: existingUser.BackgroundName ?? null,
          Moderator: existingUser.Moderator,
          levelInfo: levelInfo,
        },
        isNewUser: false,
      };
    }

    const newUser = await prisma.users.create({
      data: {
        PhoneNumber: phoneNumber,
        XpTotal: 0,
        IsVerified: false,
        IsCertified: false,
        Moderator: false,
      },
      select: {
        Id: true,
        Pseudo: true,
        PhoneNumber: true,
        PhotoUrl: true,
        XpTotal: true,
        IsVerified: true,
        IsCertified: true,
        Description: true,
        BackgroundName: true,
        Moderator: true,
      },
    });

    const levelInfo = calculateLevel(newUser.XpTotal);

    return {
      user: {
        Id: newUser.Id,
        Pseudo: null,
        PhotoUrl: newUser.PhotoUrl,
        IsVerified: newUser.IsVerified,
        IsCertified: newUser.IsCertified || false,
        Description: newUser.Description ?? null,
        BackgroundName: newUser.BackgroundName ?? null,
        Moderator: newUser.Moderator,
        levelInfo: levelInfo,
      },
      isNewUser: true,
    };
  } catch (error) {
    console.error("Erreur dans getOrCreateUserRepo:", error);
    return new CustomError(
      "Erreur lors de la gestion de l'utilisateur",
      StatusCodeEnum.InternalServerError
    );
  }
}
