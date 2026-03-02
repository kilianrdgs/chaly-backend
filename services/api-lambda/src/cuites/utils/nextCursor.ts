export function encodeCursor(id: number, createdAt: Date) {
	return Buffer.from(JSON.stringify({ id, createdAt })).toString("base64");
}

export function decodeCursor(cursor: string): {
	id: number;
	createdAt: string;
} {
	return JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
}
export function encodeClassicCursor(cursor: {
	cuitesCount: number;
	id: number;
}): string {
	return Buffer.from(JSON.stringify(cursor)).toString("base64");
}

export function decodeClassicCursor(encoded: string): {
	cuitesCount: number;
	id: number;
} {
	try {
		const decoded = Buffer.from(encoded, "base64").toString("utf-8");
		const parsed = JSON.parse(decoded);
		if (
			typeof parsed.cuitesCount !== "number" ||
			typeof parsed.id !== "number"
		) {
			throw new Error("Invalid cursor shape");
		}
		return parsed;
	} catch (e) {
		throw new Error("Invalid cursor");
	}
}
