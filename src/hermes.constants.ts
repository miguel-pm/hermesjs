import { RecognizedString } from 'uWebSockets.js';

/* -- HTTP Status Codes -- */
export const OK_STATUS: RecognizedString = '200';
export const CLIENT_ERROR_STATUS: RecognizedString = '400';
export const FORBIDDEN_STATUS: RecognizedString = '403';
export const NOT_FOUND_STATUS: RecognizedString = '404';
export const UNPROCESSABLE_ENTITY_STATUS: RecognizedString = '422';
export const SERVER_SIDE_ERROR_STATUS: RecognizedString = '500';

/* -- Response Messages -- */
export const INVALID_HTTP_METHOD_MESSAGE = 'Invalid HTTP Method';
export const INVALID_ROUTE_MESSAGE = 'The requested route is not available';
export const MALFORMED_QUERY_PARAMS_MESSAGE = 'Query params are not format appropriately';
export const MALFORMED_BODY_MESSAGE = 'Request Bodyis invalid or malformed';
export const SERVER_LISTEN_ERROR_MESSAGE = 'Initialisation of server failed';
export const SERVER_SIDE_ERROR_MESSAGE = 'Unhandled Server Error';

/* -- Hermes Functionality -- */
export const DEFAULT_PORT = 7878;
export const VALID_HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE'
];
export const METHODS_WITH_BODY = [
  'POST',
  'PUT',
  'PATCH',
  'DELETE'
];
