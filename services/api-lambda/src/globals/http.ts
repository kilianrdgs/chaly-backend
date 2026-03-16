export enum StatusCode {
	Ok = 200,
	Created = 201,
	Accepted = 202,
	BadRequest = 400,
	Unauthorized = 401,
	Forbidden = 403,
	NotFound = 404,
	Conflict = 409,
	TooManyRequests = 429,
	InternalServerError = 500,
}

export class HttpError extends Error {
	readonly statusCode: StatusCode;
	readonly error: string;
	constructor(statusCode: StatusCode, error: string, message?: string) {
		super(message);
		this.statusCode = statusCode;
		this.error = error;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
