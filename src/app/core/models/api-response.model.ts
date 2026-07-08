/**
 * Mirrors Safka.Common.GeneralResult / GeneralResult<T>.
 *
 * Backend shape (Safka.Common/GeneralResult/GeneralResult.cs):
 *   class GeneralResult {
 *     bool Success;
 *     string Message;
 *     Dictionary<string, List<Error>>? Errors;   // [JsonIgnore when null]
 *   }
 *   class GeneralResult<T> : GeneralResult {
 *     T? Data;                                    // [JsonIgnore when null]
 *   }
 *
 * Every AuthController action returns one of these two shapes as JSON,
 * so the HTTP client should always deserialize into one of the
 * interfaces below rather than the raw payload type.
 */

/** A single field/identity error, mirrors Safka.Common.Error. */
export interface ApiError {
  code: string;
  message: string;
}

/**
 * Validation/identity errors keyed by field name (or FluentValidation
 * property name), e.g. { "Email": [{ code: "...", message: "..." }] }.
 * Matches Dictionary<string, List<Error>> on the backend.
 */
export type ApiErrorDictionary = Record<string, ApiError[]>;

/** Non-generic GeneralResult (e.g. register, verify-account, forget-password). */
export interface ApiResult {
  success: boolean;
  message: string;
  errors?: ApiErrorDictionary | null;
}

/** Generic GeneralResult<T> (e.g. login -> LoginResponse, refresh -> RefreshTokenModel). */
export interface ApiResultData<T> extends ApiResult {
  data?: T | null;
}

/**
 * Shape written by ExceptionHandlingMiddleware on an unhandled exception:
 * a plain GeneralResult.FailResult("Something went wrong...") with HTTP 500.
 * Structurally identical to ApiResult, kept as an alias for readability
 * at call sites that specifically handle the catch-all 500 case.
 */
export type ApiUnhandledErrorResult = ApiResult;
