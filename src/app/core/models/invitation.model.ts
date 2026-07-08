/**
 * Every interface below is a direct mirror of a backend DTO consumed or
 * produced by Safka.API.Controllers.InvitationsController. The controller
 * is [Route("api/[controller]")] -> "Invitations" (class name minus
 * "Controller"). Field names match the C# property names exactly
 * (camelCase here because System.Text.Json's default policy in this
 * project serializes with camelCase output and model-binds
 * case-insensitively on the way in - same convention as auth.model.ts).
 *
 * Two of the six endpoints (`validate`, `complete-registration`) are
 * [AllowAnonymous] - a brand-new user with no session yet lands on
 * /invite-register?token=... from an email link, so these two are
 * functionally a registration flow, not company-management tooling. The
 * other four (`POST`, `GET`, `GET company-roles`, `PUT {id}/revoke`) are
 * [Authorize(Roles = Roles.CompanyAdmin)] - genuine admin-side invite
 * management, mounted under a roleGuard([Role.CompanyAdmin])-protected
 * route tree rather than under /auth.
 */

// ---------------------------------------------------------------------------
// GET /api/Invitations/company-roles  (CompanyAdmin only)
// Backend: RoleForCompanyDto - one entry per Safka.DAL.Enums.CompanyRole
// member, used to populate the role <select> on the invite-user form.
// NOTE: this is a different enum from core/models/role.model.ts's `Role`
// (which covers SystemAdmin/CompanyAdmin/VendorAdmin) - CompanyRole covers
// the sub-roles a CompanyAdmin can invite a teammate into.
// ---------------------------------------------------------------------------

export interface RoleForCompanyDto {
  id: number;
  name: string;
}

// ---------------------------------------------------------------------------
// POST /api/Invitations  (CompanyAdmin only)
// Backend: InviteUserDto (request) / InviteUserResponse (data payload)
// ---------------------------------------------------------------------------

export interface InviteUserRequest {
  email: string;
  /** Backend: CompanyRole enum. Sent as the numeric value, matching how
   *  [FromBody] model binding deserializes a plain (non-string) C# enum. */
  role: string;
}

export interface InviteUserResponseData {
  token: string;
}

// ---------------------------------------------------------------------------
// GET /api/Invitations/validate?token=...  (AllowAnonymous)
// Backend: GeneralResult<InvitationDetailsDto>
// ---------------------------------------------------------------------------

export interface InvitationDetailsDto {
  email: string;
  /** Backend: invitation.Role.ToString() - e.g. "Manager", "ProcurementOfficer". */
  role: string;
  companyName: string;
}

// ---------------------------------------------------------------------------
// POST /api/Invitations/complete-registration  (AllowAnonymous)
// Backend: CompleteInvitationRegistrationDto
// ---------------------------------------------------------------------------

export interface CompleteInvitationRegistrationRequest {
  token: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
}

// ---------------------------------------------------------------------------
// GET /api/Invitations?pageNumber=&pageSize=  (CompanyAdmin only)
// Backend: GeneralResult<PagedResult<InvitationListDto>>
// ---------------------------------------------------------------------------

/** Mirrors Safka.BLL.PagedResult<T> - generic paging envelope reused by any
 *  paginated list endpoint, not invitation-specific itself. */
export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export type InvitationStatusName = 'Pending' | 'Accepted' | 'Expired' | 'Revoked';

export interface InvitationListItem {
  id: number;
  email: string;
  /** Backend: invitation.Role.ToString() - e.g. "Manager". */
  role: string;
  /** Backend: invitation.Status.ToString() - mirrors Safka.DAL.Enums.InvitationStatus. */
  status: InvitationStatusName;
  createdAt: string;
  expiresAt: string;
}
