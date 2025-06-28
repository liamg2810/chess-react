import { Position } from "./Game/Position";

export function arraysEqual(arr1: unknown[], arr2: unknown[]): boolean {
	if (arr1.length !== arr2.length) return false;

	return arr1.every((value, index) => value === arr2[index]);
}

export function posInArray(arr1: Position[], value: Position): boolean {
	return arr1.some((toCheck) => toCheck.Equals(value));
}
