
export const AUTH_ENDPOINTS = {
  registerCompany: 'Auth/register-company',
  registerVendor: 'Auth/register-vendor',
  verifyAccount: 'Auth/verify-account',
  companyAddress: 'Auth/company/address',
  vendorAddress: 'Auth/vendor/address',
  login: 'Auth/login',
  forgetPassword: 'Auth/forget-password',
  verifyResetCode: 'Auth/verify-reset-code',
  resetPassword: 'Auth/reset-password',
  refreshToken: 'Auth/refreshToken',
  changePassword: 'Auth/ChangePassword',
  resendOtpRegistration: 'Auth/resend-otp-registration',
  resendOtpPasswordReset: 'Auth/resend-otp-password-reset',
  deleteUser: 'Auth/DeleteUser',
} as const;
