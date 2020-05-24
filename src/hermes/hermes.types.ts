import {
  TemplatedApp,
  HttpResponse,
  HttpRequest,
  RecognizedString
} from 'uWebSockets.js';

/* -- Main Definitions */
export interface MainDependencies {
  logger: any | Console
}
export type BootstrapFunction = (deps: MainDependencies, router: RouterFunction, port?: number, app?: TemplatedApp) => void
export type RequestHandlerFunction = (
  deps: MainDependencies,
  router: RouterFunction,
  res: HttpResponse,
  req: HttpRequest
) => Promise<HttpResponse>
export type BoundRequestHandler = (res: HttpResponse, req: HttpRequest) => Promise<HttpResponse>

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

/* -- Router Definitions */
export enum RequestMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}
export interface RouterResponse {
  status: number
  message?: string
  responseType?: 'json' | 'text'
}
export type RouterFunction = (deps: MainDependencies, req: RequestData) => Promise<RouterResponse> | RouterResponse

/* -- Error Definitions -- */
export type GenAppErrorFunction = (status: RecognizedString, message: string, error?: Error) => HermesError
export type ErrorHandler = (res: HttpResponse, logger: any | Console, error: HermesError) => HttpResponse
export type BoundErrorHandler = (error: HermesError) => void
export interface HermesError {
  status?: RecognizedString
  message?: string
  error?: Error
}
