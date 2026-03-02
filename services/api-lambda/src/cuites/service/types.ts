// cuites/service/types.ts
import type PushService from "../../communication/pushServices";
import type S3Service from "../../communication/s3Service";
import type { CuitesRepository } from "../repository/cuitesRepository";

export type ServiceDeps = {
	cuiteRepo: CuitesRepository;
	pushService: PushService;
	s3Service: S3Service;
	bucketName?: string; // fallback géré dans chaque fonction
};
