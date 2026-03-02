import { Router } from "express";

const healthRouter = Router();

// Health check endpoint - no auth required
healthRouter.get("/", async (_req, res) => {
	let databaseStatus = "disconnected";
	let databaseError: string | null = null;

	// Test database connection
	try {
		const { PrismaClient } = await import("@prisma/client");
		const prisma = new PrismaClient();

		await prisma.$queryRaw`SELECT 1`;
		await prisma.$disconnect();
		databaseStatus = "connected";
		console.log("✅ Base de données connectée");
	} catch (error) {
		databaseError = (error as Error).message;
		console.error("❌ Erreur base de données:", databaseError);
	}

	const isHealthy = databaseStatus === "connected";

	return res.status(isHealthy ? 200 : 500).json({
		status: isHealthy ? "ok" : "error",
		database: {
			status: databaseStatus,
			error: databaseError,
		},
		timestamp: new Date().toISOString(),
	});
});

export default healthRouter;
