import {
  HttpRequest,
  HttpResponse,
  RecognizedString
} from 'uWebSockets.js';
import { Either } from 'fp-ts/lib/Either';
import { Option } from 'fp-ts/lib/Option';

/* -- Main Definitions -- */
export interface RequestBody {
  [key: string]: string | number
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
/* -- Parsing Functions -- */
export type QueryParamsParserFunction = (req: HttpRequest) => QueryParams

export type MethodParserFunction = (req: HttpRequest) => Option<RequestMethods>

export type BodyParserFunction = (res: HttpResponse) => Promise<Either<Error, RequestBody>>

/* -- Error Definitions -- */
export interface HermesError {
  status?: RecognizedString
  message?: string
  error?: Error
}

export type GenHermesErrorFunction = (status: RecognizedString, message: string, error?: Error) => HermesError
