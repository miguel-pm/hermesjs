import { HttpResponse, HttpRequest } from 'uWebSockets.js'

import {
  RequestBody,
  RequestMethods,
  RequestData,
  RequestHandlerFunction,
  ErrorHandler,
  GenAppErrorFunction,
  RouterResponse
} from './definitions'

import {
  SERVER_SIDE_ERROR_STATUS,
  UNPROCESSABLE_ENTITY_STATUS
} from './constants/http_status'
import { SERVER_SIDE_ERROR_MESSAGE } from './constants/messages'
import { METHODS_WITH_BODY, VALID_HTTP_METHODS } from './constants/server'

/**
 * @function
 * @description Given a status and a message formats a new object of the type HermesError. An actual error object might
 * be passed to get the precise stack trace in the error printed.
 * @param status - A strigified number representing an HTTP status code
 * @param message - The description of the error that happened
 * @param error - An optional error object
 */
export const genAppError: GenAppErrorFunction = (status, message, error = new Error(message)) =>
  ({ status, message, error })

/**
 * @function
 * @description Function that given the HttpResponse object from uWebSockets, the desired logger and an error in the
 * HermesError format prints it on the screen and responds to the client whith the message simple message from the error.
 * @param res - uWebSockets Response object
 * @param logger - A Logger object to use to print the error in the stdout
 * @param err - Error object in the format HermesError
 */
export const errorHandler: ErrorHandler = (res, logger, err) => {
  const { status = SERVER_SIDE_ERROR_STATUS, message = SERVER_SIDE_ERROR_MESSAGE, error } = err
  const stack = error && error.hasOwnProperty('stack') ? error.stack : undefined
  logger.error(`Hermes catched Error. Status: ${status}. Message: ${message}. Stack: ${stack}`)
  return res.writeStatus(status).end(message)
}

/**
 * @async
 * @function
 * @description Body Parser for the Hermes.js Framework. Given the uWebSockets HttpResponse object serializes
 * the buffer and returns a formatted RequestBody object.
 * @param res - uWebSockets HttpResponse object
 */
export const parseBody = (res: HttpResponse): Promise<RequestBody> => new Promise((resolve, reject) => {
  let buff: Buffer
  res.onData((ab, isLast) => {
    const chunk: Buffer = Buffer.from(ab)
    if (isLast) {
      let json: RequestBody
      try {
        json = JSON.parse((Boolean(buff) ? Buffer.concat([buff, chunk]) : chunk).toString())
      } catch (e) {
        return reject(e)
      }
      resolve(json)
    } else {
      buff = Buffer.concat(Boolean(buff) ? [buff, chunk] : [chunk])
    }
  })
})

/**
 * @function
 * @description Receives the uWebSockets HttpRequest object and parses any possible query parameters
 * into an object.
 * @param req - uWebSockets HttpRequest object
 */
export const parseQueryParams = (req: HttpRequest) => {
  const rawQueryParams = req.getQuery()
  const params: { [key: string]: string } = {}
  if (!rawQueryParams || !rawQueryParams.length) return params

  for (const rawParam of rawQueryParams.split('&')) {
    const [pKey, pValue] = rawParam.split('=')
    const decodedPValue: string = decodeURIComponent(pValue)
    params[pKey] = decodedPValue
  }
  return params
}

/**
 * @function
 * @description Receives the uWebSockets HttpRequest object and formats the request method into an instance of
 * the RequestMethods enum or returns null if the obtained method is not included in the enum.
 * @param req - uWebSockets HttpRequest object
 */
export const parseMethod = (req: HttpRequest): RequestMethods | null => {
  const rawMethod = req.getMethod().toUpperCase() as RequestMethods
  if (!rawMethod || !VALID_HTTP_METHODS.includes(rawMethod)) return null
  return RequestMethods[rawMethod]
}

/**
 * @async
 * @function
 * @description Main Request handler of the Hermes.js framework. With a set of injected dependencies, a router function
 * and the HttpResponse and HttpRequest objects from uWebSockets, formats all the data from the request and calls the
 * given router function with it.
 * @param deps - Main dependencies for the project. A logger object is required and other things might be included.
 * @param router - A function to handle the expected logic.
 * @param res - uWebSockets HttpResponse object
 * @param req - uWebSockets HttpRequest object
 */
export const requestHandler: RequestHandlerFunction = async (deps, router, res, req) => {
  const { logger } = deps
  // In case the response process is aborted or closed this handler is called
  res.onAborted(() => { res.writeStatus(SERVER_SIDE_ERROR_STATUS).end(SERVER_SIDE_ERROR_MESSAGE) })

  const method = parseMethod(req)
  if (method === null) {
    const errMessage = 'Invalid HTTP Method'
    const error = new Error(errMessage)
    throw genAppError(UNPROCESSABLE_ENTITY_STATUS, errMessage, error)
  }

  const route = req.getUrl()
  const queryParams = parseQueryParams(req)

  logger.debug('Received incoming request:\n' +
    `Method => ${method};\n` +
    `Route => ${route}\n` +
    `Query Params => ${Object.keys(queryParams).reduce((acc, key) =>
      `${acc}${acc.length ? ';\n' : ''}${key} = ${queryParams[key]}`
      , '')}`)

  const headers: Map<string, string> = new Map()
  logger.debug('Request Headers:')
  req.forEach((key, value) => {
    logger.debug(`${key} => ${value}`)
    headers.set(key, value)
  })

  let body: { [key: string]: any } = {}
  if (METHODS_WITH_BODY.includes(method)) {
    body = await parseBody(res).catch(error => {
      throw genAppError(SERVER_SIDE_ERROR_STATUS, SERVER_SIDE_ERROR_MESSAGE, error)
    })
  }
  const reqData: RequestData = {
    method,
    route,
    queryParams,
    body,
    headers
  }

  let result: RouterResponse | null = null
  try {
    result = await router(deps, reqData)
  } catch (error) {
    throw genAppError(SERVER_SIDE_ERROR_STATUS, SERVER_SIDE_ERROR_MESSAGE, error)
  }
  const { status, message = '', responseType = 'json' } = result

  switch (responseType) {
    default: // JSON
      res.writeHeader('Content-Type', 'application/json')
  }
  // uWebSockets expects the status as a RecognizedString
  return res.writeStatus(`${status}`).end(message)
}
