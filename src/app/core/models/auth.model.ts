/**
 * Every interface below is a direct mirror of a backend DTO consumed or
 * produced by Safka.API.Controllers.AuthController. Field names match the
 * C# property names exactly (camelCase here because System.Text.Json's
 * default policy in this project serializes with camelCase output and
 * model-binds case-insensitively on the way in).
 */

// ---------------------------------------------------------------------------
// POST /api/Auth/login
// Backend: LoginUserDto (request) / LoginResponse (data payload)
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Backend: public record class LoginResponse(bool Succeeded, string Message,
 * string Token, string RefreshToken, object userData);
 *
 * NOTE: this record's own `Succeeded` field is distinct from the outer
 * GeneralResult<T>.Success wrapper field - the backend genuinely emits both
 * `success` (wrapper) and `succeeded` (this object) in the same response body.
 * `userData` is `object` on the backend (boxed UserDataDto) -> typed as
 * UserData here for the frontend's benefit.
 */
export interface LoginResponseData {
  succeeded: boolean;
  message: string;
  token: string;
  refreshToken: string;
  userData: UserData;
}

// ---------------------------------------------------------------------------
// Shared user payload - backend: UserDataDto
// ---------------------------------------------------------------------------

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  /** Single role name, e.g. "SystemAdmin" | "CompanyAdmin" | "VendorAdmin". */
  role: string;
}

// ---------------------------------------------------------------------------
// POST /api/Auth/register-company  (multipart/form-data)
// Backend: RegisterCompanyDto
// ---------------------------------------------------------------------------

export interface RegisterCompanyRequest {
  firstName: string;
  lastName: string;
  companyName: string;
  taxId: string;
  email: string;
  phoneNumber: string;
  password: string;
  taxCardFrontImage: File;
  taxCardBackImage: File;
}

// ---------------------------------------------------------------------------
// POST /api/Auth/register-vendor  (multipart/form-data)
// Backend: RegisterVendorDto
// ---------------------------------------------------------------------------

export interface RegisterVendorRequest {
  firstName: string;
  lastName: string;
  vendorName: string;
  taxId: string;
  email: string;
  phoneNumber: string;
  password: string;
  taxCardFrontImage: File;
  taxCardBackImage: File;
}

// ---------------------------------------------------------------------------
// POST /api/Auth/verify-account
// Backend: VerifyAccountDto (request) / GeneralResult<RegistrationSessionResponse> (response)
//
// NOTE: VerifyAccountAsync in AuthService.cs returns a registration token
// and registration type, NOT a bare success message. This token is the
// `RegistrationToken` consumed by PUT /api/Auth/company/address or
// PUT /api/Auth/vendor/address, which the sign-up flow must call as the
// (now-existing) step 3 before reaching the success screen. Without this,
// CompanyAddress/VendorAddress rows are never created for new accounts.
// ---------------------------------------------------------------------------

export interface VerifyAccountRequest {
  email: string;
  code: string;
}

/**
 * Backend: public class RegistrationSessionResponse { string
 * RegistrationToken; string Type; } where Type is RegistrationType.ToString()
 * - i.e. the literal strings "Company" or "Vendor" (not the numeric enum
 * value), since RegistrationType has no [JsonConverter] forcing numeric
 * output and AuthService passes `session.Type.ToString()` explicitly.
 */
export interface VerifyAccountResponseData {
  registrationToken: string;
  type: 'Company' | 'Vendor';
}

// ---------------------------------------------------------------------------
// PUT /api/Auth/company/address
// Backend: UpdateCompanyAddressForRegistrationDto
// ---------------------------------------------------------------------------

export interface UpdateCompanyAddressRequest {
  registrationToken: string;
  country: string;
  stateRegion: string;
  city: string;
  streetNumber?: string | null;
  fullAddress: string;
}

// ---------------------------------------------------------------------------
// PUT /api/Auth/vendor/address
// Backend: UpdateVendorAddressForRegistrationDto (Safka.BLL.Dtos.Vendor)
// Field shape is identical to the company address DTO.
// ---------------------------------------------------------------------------

export interface UpdateVendorAddressRequest {
  registrationToken: string;
  country: string;
  stateRegion: string;
  city: string;
  streetNumber?: string | null;
  fullAddress: string;
}

// ---------------------------------------------------------------------------
// POST /api/Auth/resend-otp-registration
// POST /api/Auth/resend-otp-password-reset
// Backend: ResendOtpDto (record(string Email)) - same request shape, two endpoints
// ---------------------------------------------------------------------------

export interface ResendOtpRequest {
  email: string;
}

// ---------------------------------------------------------------------------
// POST /api/Auth/forget-password
// Backend: ForgetPasswordRequest
// ---------------------------------------------------------------------------

export interface ForgetPasswordRequest {
  email: string;
}

// ---------------------------------------------------------------------------
// POST /api/Auth/verify-reset-code
// Backend: VerifyResetCodeDto (record(string Email, string Code))
// ---------------------------------------------------------------------------

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

// ---------------------------------------------------------------------------
// POST /api/Auth/reset-password
// Backend: ResetPasswordRequest
// NOTE: backend has no ConfirmPassword field (it's commented out server-side);
// confirm-password matching is enforced client-side only, then dropped before
// the request is sent.
// ---------------------------------------------------------------------------

export interface ResetPasswordRequestPayload {
  email: string;
  verificationCode: string;
  newPassword: string;
}

// ---------------------------------------------------------------------------
// POST /api/Auth/ChangePassword  (requires Authorization: Bearer <token>)
// Backend: ChangePasswordDto
// ---------------------------------------------------------------------------

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ---------------------------------------------------------------------------
// POST /api/Auth/refreshToken?oldRefreshToken=...  (requires Authorization: Bearer <expired access token>)
// Backend: RefreshTokenModel
// ---------------------------------------------------------------------------

export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
  planType?: string | null;
}
