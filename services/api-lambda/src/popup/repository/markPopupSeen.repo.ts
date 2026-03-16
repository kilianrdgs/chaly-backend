import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function markPopupSeenRepo(userId: number, popupId: number) {
  try {
    await prisma.userSeenPopup.create({
      data: {
        Id_User: userId,
        Id_Popup: popupId,
      },
    });
  } catch (e: any) {
    // Déjà vu → l'unique constraint saute → on ignore
    if (e.code === "P2002") {
      return; // Rien à faire, c'est déjà marqué
    }

    console.error("❌ Erreur markPopupSeenRepo :", e);

    throw new CustomError(
      "Impossible de marquer le popup comme vu",
      StatusCodeEnum.InternalServerError
    );
  }
}
