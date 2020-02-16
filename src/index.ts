import { App } from 'uWebSockets.js'

import { requestHandler, errorHandler } from './utils'
import {
  HermesError,
  BootstrapFunction,
  BoundRequestHandler,
  BoundErrorHandler
} from './definitions'

import { DEFAULT_PORT } from './constants/server'
import { SERVER_LISTEN_ERROR_MESSAGE } from './constants/messages'

/**
 * @function
 * @description Main Bootstrap function of the Hermes.js framework. Expects a set of dependencies
 * (a logging object is required but it can be Nodejs Console object) and a router function to handle routes and executions.
 * A specific uWebSockets TemplatedApp object and port number might be specified.
 * @param deps - Set of injected dependencies. Only mandatory one is a logging object (might be Node's console object)
 * @param router - A user defined function to handle routes and logic
 * @param [port] - (Optional) Port number to have the server connect at
 * @param [app] - (Optional) uWebSockets TemplatedApp object
 */
const Hermes: BootstrapFunction = (deps, router, port = DEFAULT_PORT, app = App()) => {
  const { logger } = deps
  const reqHandler: BoundRequestHandler = requestHandler.bind(null, deps, router)
  app
    .any('/*', (res, req) => {
      const errHandler: BoundErrorHandler = errorHandler.bind(null, res, logger)
      return reqHandler(res, req)
        .catch((error: Error | HermesError) => {
          if (error instanceof Error) error = { error } as HermesError
          return errHandler(error)
        })
    })
    .listen(port, listenSocket => {
      if (listenSocket) logger.info(`Listening on port ${port}`)
      else throw new Error(SERVER_LISTEN_ERROR_MESSAGE)
    })
}

export default Hermes
export { genAppError } from './utils'

export {
  RouterFunction,
  RequestMethods,
  MainDependencies
} from './definitions'
