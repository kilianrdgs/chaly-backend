import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function getPopupRepo(userId: number) {
  // 1. On récupère le popup actif le plus récent
  const popup = await prisma.popup.findFirst({
    where: { IsActive: true },
    orderBy: { CreatedAt: "desc" },
  });

  // Aucun popup ?
  if (!popup) return null;

  // 2. Vérifier si le user l’a déjà vu
  const hasSeen = await prisma.userSeenPopup.findFirst({
    where: {
      Id_User: userId,
      Id_Popup: popup.Id,
    },
  });

  // Si déjà vu → renvoyer null
  if (hasSeen) return null;

  // Sinon → renvoyer le popup
  return popup;
}
