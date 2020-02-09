import {
  TemplatedApp,
  HttpResponse,
  HttpRequest,
  RecognizedString
} from 'uWebSockets.js'
import { Logger } from 'winston'

export enum RequestMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export interface MainDependencies {
  logger: Logger | Console
}

export interface RouterFunction {
  (deps: MainDependencies, req: RequestData, res: HttpResponse): Promise<HttpResponse>
}
export interface GenAppErrorFunction {
  (status: RecognizedString, message: string, error?: Error): HermesError
}

export interface BootstrapFunction {
  (deps: MainDependencies, router: RouterFunction, app?: TemplatedApp, port?: number): void
}
export interface RequestHandlerFunction {
  (deps: MainDependencies, router: RouterFunction, res: HttpResponse, req: HttpRequest): Promise<HttpResponse>
}
export interface BoundRequestHandler {
  (res: HttpResponse, req: HttpRequest): Promise<HttpResponse>
}
export interface ErrorHandler {
  (res: HttpResponse, logger: Logger | Console, error: HermesError): HttpResponse
}
export interface BoundErrorHandler {
  (error: HermesError): void
}

export interface RequestBody {
  [key: string]: string | number
}

export interface RequestData {
  method: RequestMethods
  route: string
  queryParams: { [key: string]: string }
  body: RequestBody | {}
  headers: Map<string, string>
}

export interface HermesError {
  status?: RecognizedString
  message?: string
  error?: Error
}
