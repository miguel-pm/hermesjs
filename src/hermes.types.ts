import {
  HttpRequest,
  HttpResponse,
  RecognizedString,
  TemplatedApp
} from 'uWebSockets.js';
import { Either } from 'fp-ts/lib/Either';
import { Option } from 'fp-ts/lib/Option';

/* -- Main Definitions -- */
export type ApplicationLogger = Console
export interface MainDependencies {
  logger: ApplicationLogger
}
export type HermesFunction = (
  router: RouterFunction,
  deps?: MainDependencies,
  port?: number,
  app?: TemplatedApp
) => void

export interface RequestBody {
  [key: string]: string | number
}
export interface Headers {
  [key: string]: string
}
export interface QueryParams {
  [key: string]: string
}
export enum RequestMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

export type RequestHandlerFunction = (
  deps: MainDependencies,
  router: RouterFunction,
  res: HttpResponse,
  req: HttpRequest
) => Promise<Either<HermesError, RequestResponse>>

/* -- Router Definitions -- */
export interface RequestData {
  method: RequestMethods
  route: string
  queryParams: { [key: string]: string }
  body: any
  headers: { [key: string]: string }
}
export interface RequestResponse {
  status: number
  message?: string
  responseType?: 'json' | 'text'
}
export type RouterFunction = (deps: MainDependencies, req: RequestData) => Promise<RequestResponse> | RequestResponse

/* -- Parsing Functions -- */
export type QueryParamsParserFunction = (req: HttpRequest) => QueryParams

export type MethodParserFunction = (req: HttpRequest) => Option<RequestMethods>

export type HeaderParserFunction = (req: HttpRequest) => Headers

export type BodyParserFunction = (res: HttpResponse) => Promise<Either<Error, RequestBody>>

/* -- Error Definitions -- */
export interface HermesError {
  status?: RecognizedString
  message?: string
  error?: Error
}

export type GenHermesErrorFunction = (status: RecognizedString, message: string, error?: Error) => HermesError

export type ErrorHandlerFunction = (res: HttpResponse, logger: ApplicationLogger, error: HermesError) => void
