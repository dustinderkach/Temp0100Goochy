import { Temp009GoochyEntry } from "../model/Model";

export class MissingFieldError extends Error {
	constructor(missingField: string) {
		super(`Value for ${missingField} expected!`);
	}
}

export class JsonError extends Error {}

export function validateAsTemp009GoochyEntry(arg: any) {
	if ((arg as Temp009GoochyEntry).location == undefined) {
		throw new MissingFieldError("location");
	}
	if ((arg as Temp009GoochyEntry).name == undefined) {
		throw new MissingFieldError("name");
	}
	if ((arg as Temp009GoochyEntry).id == undefined) {
		throw new MissingFieldError("id");
	}
}
