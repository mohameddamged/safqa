import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AUTH_ENDPOINTS } from '../constants/api-endpoints';
import {
  ApiResult,
  ApiResultData,
  ChangePasswordRequest,
  ForgetPasswordRequest,
  LoginRequest,
  LoginResponseData,
  RefreshTokenResponseData,
  RegisterCompanyRequest,
  RegisterVendorRequest,
  ResendOtpRequest,
  ResetPasswordRequestPayload,
  UpdateCompanyAddressRequest,
  UpdateVendorAddressRequest,
  UserData,
  VerifyAccountRequest,
  VerifyAccountResponseData,
  VerifyResetCodeRequest,
} from '../models';
import { TokenStorageService } from './token-storage.service';

const baseUrl = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);

  /** Current authenticated user, or null when signed out. Read-only outside this service. */
  private readonly currentUserSignal = signal<UserData | null>(
    this.tokenStorage.getUser(),
  );

  readonly currentUser = this.currentUserSignal.asReadonly();

  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  readonly role = computed(() => this.currentUserSignal()?.role ?? null);

  // ---------------------------------------------------------------------
  // POST /api/Auth/register-company  (multipart/form-data)
  // ---------------------------------------------------------------------
  registerCompany(request: RegisterCompanyRequest): Observable<ApiResult> {
    const formData = new FormData();
    formData.append('FirstName', request.firstName);
    formData.append('LastName', request.lastName);
    formData.append('CompanyName', request.companyName);
    formData.append('TaxId', request.taxId);
    formData.append('Email', request.email);
    formData.append('PhoneNumber', request.phoneNumber);
    formData.append('Password', request.password);
    formData.append('TaxCardFrontImage', request.taxCardFrontImage);
    formData.append('TaxCardBackImage', request.taxCardBackImage);

    return this.http.post<ApiResult>(`${baseUrl}/${AUTH_ENDPOINTS.registerCompany}`, formData);
  }

  // ---------------------------------------------------------------------
  // POST /api/Auth/register-vendor  (multipart/form-data)
  // ---------------------------------------------------------------------
  registerVendor(request: RegisterVendorRequest): Observable<ApiResult> {
    const formData = new FormData();
    formData.append('FirstName', request.firstName);
    formData.append('LastName', request.lastName);
    formData.append('VendorName', request.vendorName);
    formData.append('TaxId', request.taxId);
    formData.append('Email', request.email);
    formData.append('PhoneNumber', request.phoneNumber);
    formData.append('Password', request.password);
    formData.append('TaxCardFrontImage', request.taxCardFrontImage);
    formData.append('TaxCardBackImage', request.taxCardBackImage);

    return this.http.post<ApiResult>(`${baseUrl}/${AUTH_ENDPOINTS.registerVendor}`, formData);
  }

  // ---------------------------------------------------------------------
  // POST /api/Auth/verify-account
  // Backend returns GeneralResult<RegistrationSessionResponse> - a
  // registrationToken + type ("Company" | "Vendor") - NOT a bare ApiResult,
  // because this token is required by the address step that follows
  // (updateCompanyAddress / updateVendorAddress below).
  // ---------------------------------------------------------------------
  verifyAccount(request: VerifyAccountRequest): Observable<ApiResultData<VerifyAccountResponseData>> {
    return this.http.post<ApiResultData<VerifyAccountResponseData>>(
      `${baseUrl}/${AUTH_ENDPOINTS.verifyAccount}`,
      request,
    );
  }

  // ---------------------------------------------------------------------
  // PUT /api/Auth/company/address
  // Final step of the company sign-up wizard. Consumes the
  // registrationToken returned by verifyAccount() above.
  // ---------------------------------------------------------------------
  updateCompanyAddress(request: UpdateCompanyAddressRequest): Observable<ApiResult> {
    return this.http.put<ApiResult>(`${baseUrl}/${AUTH_ENDPOINTS.companyAddress}`, request);
  }

  // ---------------------------------------------------------------------
  // PUT /api/Auth/vendor/address
  // Final step of the vendor sign-up wizard. Consumes the
  // registrationToken returned by verifyAccount() above.
  // ---------------------------------------------------------------------
  updateVendorAddress(request: UpdateVendorAddressRequest): Observable<ApiResult> {
    return this.http.put<ApiResult>(`${baseUrl}/${AUTH_ENDPOINTS.vendorAddress}`, request);
  }

  // ---------------------------------------------------------------------
  // POST /api/Auth/resend-otp-registration
  // ---------------------------------------------------------------------
  resendRegistrationOtp(request: ResendOtpRequest): Observable<ApiResult> {
    return this.http.post<ApiResult>(
      `${baseUrl}/${AUTH_ENDPOINTS.resendOtpRegistration}`,
      request,
    );
  }

  // ---------------------------------------------------------------------
  // POST /api/Auth/login
  // On success, persists the session (token storage) and updates the
  // currentUser signal so the whole app reacts immediately.
  // ---------------------------------------------------------------------
  login(request: LoginRequest, rememberMe: boolean): Observable<ApiResultData<LoginResponseData>> {
    return this.http
      .post<ApiResultData<LoginResponseData>>(`${baseUrl}/${AUTH_ENDPOINTS.login}`, request)
      .pipe(
        tap((result) => {
          if (result.success && result.data) {
            this.tokenStorage.setSession({
              accessToken: result.data.token,
              refreshToken: result.data.refreshToken,
              user: result.data.userData,
              rememberMe,
            });
            this.currentUserSignal.set(result.data.userData);
          }
        }),
      );
  }

  // ---------------------------------------------------------------------
  // POST /api/Auth/forget-password
  // ---------------------------------------------------------------------
  forgetPassword(request: ForgetPasswordRequest): Observable<ApiResult> {
    return this.http.post<ApiResult>(`${baseUrl}/${AUTH_ENDPOINTS.forgetPassword}`, request);
  }

  // ---------------------------------------------------------------------
  // POST /api/Auth/verify-reset-code
  // ---------------------------------------------------------------------
  verifyResetCode(request: VerifyResetCodeRequest): Observable<ApiResult> {
    return this.http.post<ApiResult>(`${baseUrl}/${AUTH_ENDPOINTS.verifyResetCode}`, request);
  }

  // ---------------------------------------------------------------------
  // POST /api/Auth/resend-otp-password-reset
  // ---------------------------------------------------------------------
  resendPasswordResetOtp(request: ResendOtpRequest): Observable<ApiResult> {
    return this.http.post<ApiResult>(
      `${baseUrl}/${AUTH_ENDPOINTS.resendOtpPasswordReset}`,
      request,
    );
  }

  // ---------------------------------------------------------------------
  // POST /api/Auth/reset-password
  // ---------------------------------------------------------------------
  resetPassword(request: ResetPasswordRequestPayload): Observable<ApiResult> {
    return this.http.post<ApiResult>(`${baseUrl}/${AUTH_ENDPOINTS.resetPassword}`, request);
  }

  // ---------------------------------------------------------------------
  // POST /api/Auth/ChangePassword  (requires Authorization header - added by AuthInterceptor)
  // Backend returns a bare { Message } object on success, not a GeneralResult,
  // so this intentionally types the success path loosely while still
  // sharing the ApiResult error shape (BadRequest(result) on failure).
  // ---------------------------------------------------------------------
  changePassword(request: ChangePasswordRequest): Observable<{ message?: string } & Partial<ApiResult>> {
    return this.http.post<{ message?: string } & Partial<ApiResult>>(
      `${baseUrl}/${AUTH_ENDPOINTS.changePassword}`,
      request,
    );
  }

  // ---------------------------------------------------------------------
  // POST /api/Auth/refreshToken?oldRefreshToken=...
  // Requires a (possibly expired) access token on the Authorization header -
  // the backend reads claims out of it via ExtractClaimFromExpiredToken
  // regardless of its expiry, so the interceptor must still attach it.
  // ---------------------------------------------------------------------
  refreshToken(oldRefreshToken: string): Observable<ApiResultData<RefreshTokenResponseData>> {
    const params = new URLSearchParams({ oldRefreshToken });
    return this.http
      .post<ApiResultData<RefreshTokenResponseData>>(
        `${baseUrl}/${AUTH_ENDPOINTS.refreshToken}?${params.toString()}`,
        {},
      )
      .pipe(
        tap((result) => {
          if (result.success && result.data) {
            this.tokenStorage.updateAccessToken(
              result.data.accessToken,
              result.data.refreshToken,
            );
          }
        }),
      );
  }

  // ---------------------------------------------------------------------
  // DELETE /api/Auth/DeleteUser  (requires Authorization header)
  // ---------------------------------------------------------------------
  deleteUser(): Observable<ApiResult> {
    return this.http.delete<ApiResult>(`${baseUrl}/${AUTH_ENDPOINTS.deleteUser}`);
  }

  /** Clears all local session state. Does not call any backend endpoint - there is no logout endpoint. */
  logout(): void {
    this.tokenStorage.clear();
    this.currentUserSignal.set(null);
  }

  getAccessToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }

  getRefreshToken(): string | null {
    return this.tokenStorage.getRefreshToken();
  }
}
