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

/** Get string as a valid RequestMethods value */
export const getStringAsRequestMethod = (value: string): RequestMethods => value as RequestMethods;

/** Returns a key value pair storage as a semicolon and newline separated string */
export const stringifyKeyValuePair = (object: { [key: string]: string | number | null }): string =>
  Object.keys(object).reduce((acc, k) =>
    `${acc}${acc.length > 0 ? '\n' : ''}${k} = ${String(object[k])};`
  , '');

/**
 * Given a status and a message formats a new object of the type HermesError. An actual error object might
 * be passed to get the precise stack trace in the error printed.
 */
export const genHermesError: GenHermesErrorFunction = (status, message, error = new Error(message)) =>
  ({ status, message, error });

/**
 * Function that given the HttpResponse object from uWebSockets and an error in the
 * HermesError format. Prints the error to the terminal and responds to the client
 * whith the simple message from the error.
 */
export const errorHandler: ErrorHandlerFunction = (res, err) => {
  const { status = SERVER_SIDE_ERROR_STATUS, message = SERVER_SIDE_ERROR_MESSAGE, error } = err;
  const stack = error?.stack;
  console.error(`Hermes catched Error. Status: ${String(status)}. Message: ${message}. Stack: ${String(stack)}`);
  res.writeStatus(status).end(message);
};

/**
 * Body Parser for the Hermes.js Framework. Given the uWebSockets HttpResponse object serializes
 * the buffer and returns a response that is either formatted RequestBody object or an error.
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

/** Receives the uWebSockets HttpRequest object and parses any possible query parameters into a key-value pair storage. */
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
 * Receives the uWebSockets HttpRequest object and formats the request method into an instance of
 * the RequestMethods enum or returns null if the obtained method is not included in the enum.
 */
export const parseMethod: MethodParserFunction = req => {
  const rawMethod = req.getMethod().toUpperCase();
  if (
    !isValidString(rawMethod) ||
    !Object.keys(RequestMethods).includes(rawMethod)) return none;
  // We know more than the compiler in this instance
  return some(RequestMethods[getStringAsRequestMethod(rawMethod)]);
};

/** Given the request object stores the headers in an object and returns it */
export const parseHeaders: HeaderParserFunction = req => {
  const headers: Headers = {};
  req.forEach((key, value) => { headers[key] = value; });
  return headers;
};
