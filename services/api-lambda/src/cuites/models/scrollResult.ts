import type { CuiteScrollData } from "./cuiteScroll.model";

export type ScrollResultData = {
	cuites: CuiteScrollData[];
	cursor: string | null;
	nbOfCuites?: number;
};
