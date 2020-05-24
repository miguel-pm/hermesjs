import { isNone } from 'fp-ts/lib/Option';
import { left, right, isLeft } from 'fp-ts/lib/Either';

import {
  HermesError,
  RequestData,
  HermesFunction,
  RequestHandlerFunction
} from './hermes.types';
import {
  genHermesError,
  parseBody,
  parseMethod,
  parseQueryParams,
  parseHeaders,
  stringifyKeyValuePair,
  errorHandler
} from './hermes.utils';
import {
  METHODS_WITH_BODY,
  INVALID_HTTP_METHOD_MESSAGE,
  UNPROCESSABLE_ENTITY_STATUS,
  MALFORMED_BODY_MESSAGE,
  SERVER_SIDE_ERROR_STATUS,
  SERVER_SIDE_ERROR_MESSAGE,
  DEFAULT_PORT,
  SERVER_LISTEN_ERROR_MESSAGE
} from './hermes.constants';
import { App } from 'uWebSockets.js';
import { isValid } from './hermes.validators';

/**
 * @description Main Request handler of the Hermes.js framework. With injected dependencies, a router function
 * and the HttpResponse and HttpRequest objects from uWebSockets, formats all the data from the request and calls the
 * given router function with it. Should allways return an object with status, an optional message for the client and
 * valid value for the response type header.
 * @param deps - Main dependencies for the project. A logger object is required and other things might be included.
 * @param router - A function to handle the expected logic.
 * @param res - uWebSockets HttpResponse object
 * @param req - uWebSockets HttpRequest object
 */
const requestHandler: RequestHandlerFunction = async (deps, router, res, req) => {
  const { logger } = deps;
  // In case the response process is aborted or closed this handler is called
  res.onAborted(() => { res.aborted = true; });

  const parsedMethod = parseMethod(req);
  if (isNone(parsedMethod)) {
    const errMessage = INVALID_HTTP_METHOD_MESSAGE;
    return left(genHermesError(
      UNPROCESSABLE_ENTITY_STATUS,
      errMessage,
      new Error(errMessage)));
  }
  const method = parsedMethod.value;
  const route = req.getUrl();
  const queryParams = parseQueryParams(req);
  const headers = parseHeaders(req);

  const parsedBody = METHODS_WITH_BODY.includes(method)
    ? await parseBody(res)
    : right({});
  if (isLeft(parsedBody)) {
    const errMessage = MALFORMED_BODY_MESSAGE;
    return left(genHermesError(
      UNPROCESSABLE_ENTITY_STATUS,
      errMessage,
      new Error(errMessage)));
  }

  logger.debug('Received incoming request:\n' +
    `Method => ${method};\n` +
    `Route => ${route};\n` +
    `Query Params => ${stringifyKeyValuePair(queryParams)};\n` +
    `Headers =>  ${stringifyKeyValuePair(headers)};` +
    `Body =>  ${stringifyKeyValuePair(parsedBody.right)};`);
  const reqData: RequestData = {
    method,
    route,
    queryParams,
    headers,
    body: parsedBody.right
  };

  try {
    const result = await router(deps, reqData);
    return right(result);
  } catch (error) {
    return left(genHermesError(
      SERVER_SIDE_ERROR_STATUS,
      SERVER_SIDE_ERROR_MESSAGE,
      error));
  }
};

/**
 * @description Main Bootstrap function of the Hermes.js framework. Expects a set of dependencies
 * (a logging object is required but it can be Nodejs Console object) and a router function to handle routes and executions.
 * A specific uWebSockets TemplatedApp object and port number might be specified.
 * @param router - A user defined function to handle routes and logic
 * @param [deps] - (Optional) Set of injected dependencies which will be provided to the router.
 * If nothing is provided Node's Console will be used as logger
 * @param [port] - (Optional) Port number to have the server connect at
 * @param [app] - (Optional) uWebSockets TemplatedApp object
 */
export const hermes: HermesFunction = (router, deps = { logger: console }, port = DEFAULT_PORT, application = App()) => {
  const { logger } = deps;
  application
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .any('/*', async (res, req) => {
      const handlerResult = await requestHandler(deps, router, res, req)
        .catch((error: Error | HermesError) => {
          const formattedError: HermesError = error instanceof Error ? { error } : error;
          return left(formattedError);
        });
      if (res.aborted === true) {
        logger.warn('Aborted response, halting execution');
        return;
      };
      if (isLeft(handlerResult)) return errorHandler(res, logger, handlerResult.left);
      const { message = '', status, responseType = 'json' } = handlerResult.right;
      // Write the status to the response
      res.writeStatus(`${status}`);
      // Write Headers to the response
      switch (responseType) {
        default: // JSON
          res.writeHeader('Content-Type', 'application/json');
      }
      // Send response
      res.end(message);
    })
    .listen(port, listenSocket => {
      if (isValid(listenSocket)) logger.info(`Listening on port ${port}`);
      else throw new Error(SERVER_LISTEN_ERROR_MESSAGE);
    });
};
