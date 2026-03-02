export default class CustomError {
	constructor(
		public Message: string | null,
		public StatusCode: StatusCodeEnum,
		public error?: string,
	) {}
}

export enum StatusCodeEnum {
	Ok = 200,
	Created = 201,
	Accepted = 202,
	NoContent = 204,
	NotModified = 304,
	BadRequest = 400,
	Unauthorized = 401,
	NotFound = 404,
	RequestTimeOut = 408,
	Conflict = 409,
	TooManyRequests = 429,
	InternalServerError = 500,
}
