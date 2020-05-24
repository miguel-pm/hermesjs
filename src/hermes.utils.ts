import { none, some } from 'fp-ts/lib/Option';
import { left, right } from 'fp-ts/lib/Either';

import { isValid, isValidString } from './hermes.validators';
import {
  RequestBody,
  RequestMethods,
  GenHermesErrorFunction,
  BodyParserFunction,
  QueryParamsParserFunction,
  QueryParams,
  MethodParserFunction,
  HeaderParserFunction,
  Headers,
  ErrorHandlerFunction
} from './hermes.types';
import {
  SERVER_SIDE_ERROR_STATUS,
  SERVER_SIDE_ERROR_MESSAGE
} from './hermes.constants';

/**
 * @description Get string as a valid RequestMethods value
 * @param value - The previously validate string to consider a RequestMethod entry
 */
export const getStringAsRequestMethod = (value: string): RequestMethods => value as RequestMethods;

/**
 * @description Returns a key value pair storage as a semicolon and newline separated string
 * @param object - Key value pair to be stringified
 */
export const stringifyKeyValuePair = (object: { [key: string]: string | number | null }): string =>
  Object.keys(object).reduce((acc, k) =>
    `${acc}${acc.length > 0 ? '\n' : ''}${k} = ${String(object[k])};`
  , '');

/**
 * @description Given a status and a message formats a new object of the type HermesError. An actual error object might
 * be passed to get the precise stack trace in the error printed.
 * @param status - A strigified number representing an HTTP status code
 * @param message - The description of the error that happened
 * @param error - An optional error object
 */
export const genHermesError: GenHermesErrorFunction = (status, message, error = new Error(message)) =>
  ({ status, message, error });

/**
 * @description Function that given the HttpResponse object from uWebSockets, the desired logger and an error in the
 * HermesError format prints it on the screen and responds to the client whith the message simple message from the error.
 * @param res - uWebSockets Response object
 * @param logger - A Logger object to use to print the error in the stdout
 * @param err - Error object in the format HermesError
 */
export const errorHandler: ErrorHandlerFunction = (res, logger, err) => {
  const { status = SERVER_SIDE_ERROR_STATUS, message = SERVER_SIDE_ERROR_MESSAGE, error } = err;
  const stack = error?.stack;
  logger.error(`Hermes catched Error. Status: ${String(status)}. Message: ${message}. Stack: ${String(stack)}`);
  res.writeStatus(status).end(message);
};

/**
 * @description Body Parser for the Hermes.js Framework. Given the uWebSockets HttpResponse object serializes
 * the buffer and returns a response that is either formatted RequestBody object or an error.
 * @param res - uWebSockets HttpResponse object
 */
export const parseBody: BodyParserFunction = async res => new Promise(resolve => {
  let buff: Buffer;
  const dataCB = (ab: ArrayBuffer, isLast: boolean): void => {
    const chunk: Buffer = Buffer.from(ab);
    if (isLast) {
      try {
        const json: RequestBody = JSON.parse(
          (isValid(buff)
            ? Buffer.concat([buff, chunk]) : chunk
          ).toString());
        resolve(right(json));
      } catch (e) {
        return resolve(left(e));
      }
    } else {
      buff = Buffer.concat(isValid(buff) ? [buff, chunk] : [chunk]);
    }
  };
  res.onData(dataCB);
});

/**
 * @description Receives the uWebSockets HttpRequest object and parses any possible
 * query parameters into a key-value pair storage.
 * @param req - uWebSockets HttpRequest object
 */
export const parseQueryParams: QueryParamsParserFunction = req => {
  const rawQueryParams = req.getQuery();
  if (!isValidString(rawQueryParams)) return {};

  const accumulator: QueryParams = {};
  return rawQueryParams.split('&').reduce((acc, rawParam) => {
    const [pKey, pValue] = rawParam.split('=');
    const decodedPValue = decodeURIComponent(pValue);
    return { ...acc, [pKey]: decodedPValue };
  }, accumulator);
};

/**
 * @description Receives the uWebSockets HttpRequest object and formats the request method into an instance of
 * the RequestMethods enum or returns null if the obtained method is not included in the enum.
 * @param req - uWebSockets HttpRequest object
 */
export const parseMethod: MethodParserFunction = req => {
  const rawMethod = req.getMethod().toUpperCase();
  if (
    !isValidString(rawMethod) ||
    !Object.keys(RequestMethods).includes(rawMethod)) return none;
  // We know more than the compiler in this instance
  return some(RequestMethods[getStringAsRequestMethod(rawMethod)]);
};

/**
 * @description Given the request object stores the headers in an object and returns it
 * @param req - uWebSockets HttpRequest object
 */
export const parseHeaders: HeaderParserFunction = req => {
  const headers: Headers = {};
  req.forEach((key, value) => { headers[key] = value; });
  return headers;
};
