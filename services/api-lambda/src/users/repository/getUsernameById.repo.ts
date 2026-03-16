import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function getUsernameByIdRepo(id: number) {
  try {
    const username = await prisma.users.findFirst({
      where: { Id: id },
      select: { Pseudo: true },
    });
    if (!id)
      return new CustomError(
        "Erreur lors de la récupération d'id du user.",
        StatusCodeEnum.NoContent
      );
    return username?.Pseudo;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'id a partir du pseudo. Erreur:",
      error
    );
    return new CustomError(
      "Erreur lors de la récupération d'id du user.",
      StatusCodeEnum.InternalServerError
    );
  }
}
