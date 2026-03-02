import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import type { CuitePointData } from "../models/cuitePoint.model";

export async function getCuitePointByIdRepo(id: number) {
	try {
		const cuiteInfo = await prisma.cuites.findUnique({
			where: {
				Id: id,
			},
			select: {
				Id: true,
				ImageUrl: true,
			},
		});
		if (!cuiteInfo)
			return new CustomError(
				"Pas de cuite pour cet id",
				StatusCodeEnum.NotFound,
			);
		const cuitePoint: CuitePointData = {
			Id: cuiteInfo.Id,
			Photo: cuiteInfo.ImageUrl || "",
		};
		return cuitePoint;
	} catch (error) {
		console.error(
			"Erreur lors de la récupération du point de la cuite:",
			error,
		);
		return new CustomError(
			"Erreur lors de la récupération du point de la cuite",
			StatusCodeEnum.InternalServerError,
		);
	}
}
