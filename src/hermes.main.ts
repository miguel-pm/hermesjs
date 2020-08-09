/* eslint-disable @typescript-eslint/no-misused-promises */
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
 * Main Request handler of the Hermes.js framework. With injected dependencies, a router function
 * and the HttpResponse and HttpRequest objects from uWebSockets, formats all the data from the request and calls the
 * given router function with it. Should allways return an object with status, an optional message for the client and
 * valid value for the response type header.
 */
const requestHandler: RequestHandlerFunction = async (router, res, req) => {
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

  console.debug('Received incoming request:\n' +
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
    const result = await router(reqData);
    return right(result);
  } catch (error) {
    return left(genHermesError(
      SERVER_SIDE_ERROR_STATUS,
      SERVER_SIDE_ERROR_MESSAGE,
      error));
  }
};

/**
 * Main Bootstrap function of the Hermes.js framework. Expects a router function to handle routes and executions.
 * A specific uWebSockets TemplatedApp object and port number might be specified.
 */
export const hermes: HermesFunction = (router, port = DEFAULT_PORT, application = App()) => {
  application
    .any('/*', async (res, req) => {
      const handlerResult = await requestHandler(router, res, req)
        .catch((error: Error | HermesError) => {
          const formattedError: HermesError = error instanceof Error ? { error } : error;
          return left(formattedError);
        });
      if (res.aborted === true) {
        console.warn('Aborted response, halting execution');
        return;
      };
      if (isLeft(handlerResult)) return errorHandler(res, handlerResult.left);
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
      if (isValid(listenSocket)) console.info(`Hermes listening on port ${port}`);
      else throw new Error(SERVER_LISTEN_ERROR_MESSAGE);
    });
};
