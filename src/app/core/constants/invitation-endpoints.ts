
export const INVITATION_ENDPOINTS = {
  companyRoles: 'Invitations/company-roles',
  invite: 'Invitations',
  validate: 'Invitations/validate',
  completeRegistration: 'Invitations/complete-registration',
  revoke: (invitationId: number) => `Invitations/${invitationId}/revoke`,
  list: 'Invitations',
} as const;
