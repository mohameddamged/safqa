import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { INVITATION_ENDPOINTS } from '../constants/invitation-endpoints';
import {
  ApiResult,
  ApiResultData,
  CompleteInvitationRegistrationRequest,
  InvitationDetailsDto,
  InvitationListItem,
  InviteUserRequest,
  InviteUserResponseData,
  PagedResult,
  RoleForCompanyDto,
} from '../models';

const baseUrl = environment.apiUrl;

/**
 * Wraps every action on Safka.API.Controllers.InvitationsController.
 *
 * Two methods here (validateInvitation, completeInvitationRegistration)
 * are called from public, unauthenticated pages (the invite-register
 * flow) - they correspond to the controller's [AllowAnonymous] actions
 * and must NOT receive an Authorization header even if a stale token
 * exists in storage from a previous session (handled in
 * auth.interceptor.ts's PUBLIC_AUTH_PATHS list).
 *
 * The other four (getCompanyRoles, inviteUser, revokeInvitation,
 * getCompanyInvitations) require a CompanyAdmin session - the interceptor
 * attaches the Authorization header automatically since these paths are
 * not in PUBLIC_AUTH_PATHS.
 */
@Injectable({ providedIn: 'root' })
export class InvitationService {
  private readonly http = inject(HttpClient);

  // ---------------------------------------------------------------------
  // GET /api/Invitations/company-roles  (CompanyAdmin only)
  // Backend returns a bare GeneralResult<IEnumerable<RoleForCompanyDto>>
  // via Ok(result) with no success/fail branch in the controller, so a
  // request that somehow fails server-side still arrives as 200 with
  // success:false rather than a 4xx - callers should still check
  // result.success defensively.
  // ---------------------------------------------------------------------
  getCompanyRoles(): Observable<ApiResultData<RoleForCompanyDto[]>> {
    return this.http.get<ApiResultData<RoleForCompanyDto[]>>(
      `${baseUrl}/${INVITATION_ENDPOINTS.companyRoles}`,
    );
  }

  // ---------------------------------------------------------------------
  // POST /api/Invitations  (CompanyAdmin only)
  // ---------------------------------------------------------------------
  inviteUser(request: InviteUserRequest): Observable<ApiResultData<InviteUserResponseData>> {
    return this.http.post<ApiResultData<InviteUserResponseData>>(
      `${baseUrl}/${INVITATION_ENDPOINTS.invite}`,
      request,
    );
  }

  // ---------------------------------------------------------------------
  // GET /api/Invitations/validate?token=...  (AllowAnonymous)
  // ---------------------------------------------------------------------
  validateInvitation(token: string): Observable<ApiResultData<InvitationDetailsDto>> {
    return this.http.get<ApiResultData<InvitationDetailsDto>>(
      `${baseUrl}/${INVITATION_ENDPOINTS.validate}`,
      { params: { token } },
    );
  }

  // ---------------------------------------------------------------------
  // POST /api/Invitations/complete-registration  (AllowAnonymous)
  // ---------------------------------------------------------------------
  completeInvitationRegistration(
    request: CompleteInvitationRegistrationRequest,
  ): Observable<ApiResult> {
    return this.http.post<ApiResult>(
      `${baseUrl}/${INVITATION_ENDPOINTS.completeRegistration}`,
      request,
    );
  }

  // ---------------------------------------------------------------------
  // PUT /api/Invitations/{invitationId}/revoke  (CompanyAdmin only)
  // ---------------------------------------------------------------------
  revokeInvitation(invitationId: number): Observable<ApiResult> {
    return this.http.put<ApiResult>(
      `${baseUrl}/${INVITATION_ENDPOINTS.revoke(invitationId)}`,
      {},
    );
  }

  // ---------------------------------------------------------------------
  // GET /api/Invitations?pageNumber=&pageSize=  (CompanyAdmin only)
  // Same bare-Ok(result) note as getCompanyRoles above applies here too.
  // ---------------------------------------------------------------------
  getCompanyInvitations(
    pageNumber: number,
    pageSize: number,
  ): Observable<ApiResultData<PagedResult<InvitationListItem>>> {
    return this.http.get<ApiResultData<PagedResult<InvitationListItem>>>(
      `${baseUrl}/${INVITATION_ENDPOINTS.list}`,
      { params: { pageNumber, pageSize } },
    );
  }
}
