import type { Options } from "swagger-jsdoc";

const PORT = 3000;

const options: Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Chaly API",
			version: "1.0.0",
			description: "API Chaly",
		},
		servers: [
			{
				url: `http://localhost:${PORT}`,
			},
		],
		components: {
			securitySchemes: {
				BearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
		security: [
			{
				BearerAuth: [],
			},
		],
	},
	apis: ["./src/**/*.ts"],
};

export default options;
