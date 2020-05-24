/**
 * @description Returns false if the given value is an undefined or null value
 * @param value - Any object that needs checking
 */
export const isValid = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;

/**
 * @description Returns true and tells the TypesCript compiler that the given value is a valid string
 * when this is the case
 * @param str - Variable to check
 */
export const isValidString = (str: any): str is string => isValid(str) && typeof str === 'string' && str.length > 0;

/**
 * @description Returns true and tells the TypesCript compiler that the given value is a valid number
 * when this is the case
 * @param num - Variable to check
 */
export const isValidNumber = (num: any): num is number => isValid(num) && !isNaN(Number(num));

/**
 * @description Returns true and tells the TypesCript compiler that the given value is a valid number
 * when this is the case
 * @param num - Variable to check
 */
export const isValidArray = <T>(arr: any): arr is T[] => isValid(arr) && Array.isArray(arr);

/**
 * @description Given a number variable returns it or none if it is not a valid non-zero positive number
 * @param value - The number to check
 */
export const isNonzeroUnsignedNum = (value: number): boolean => isValidNumber(value) && Number(value) > 0;
