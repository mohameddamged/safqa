import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { INVITATION_ENDPOINTS } from '../../constants/invitation-endpoints';

export type MemberStatus = 'Active' | 'Invited' | 'Suspended';

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  email: string;
  status: MemberStatus;
}

function toMemberStatus(invStatus: string): MemberStatus {
  switch (invStatus) {
    case 'Accepted': return 'Active';
    case 'Pending':  return 'Invited';
    default:         return 'Suspended';
  }
}

function toTeamMember(inv: any): TeamMember {
  return {
    id:       String(inv.id),
    name:     inv.status === 'Accepted' ? inv.email.split('@')[0] : '---',
    position: inv.role,
    email:    inv.email,
    status:   toMemberStatus(inv.status),
  };
}

@Injectable({ providedIn: 'root' })
export class MembersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  readonly members = signal<TeamMember[]>([]);
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);

  loadMembers(): Observable<TeamMember[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .get<any>(`${this.baseUrl}/${INVITATION_ENDPOINTS.list}`, {
        params: { pageNumber: 1, pageSize: 100 }
      })
      .pipe(
        map((result: any) => {
          this.loading.set(false);
          if (result.success && result.data) {
            const mapped = (result.data.items as any[]).map(toTeamMember);
            this.members.set(mapped);
            return mapped;
          }
          this.error.set(result.message || 'Could not load team members.');
          return [];
        }),
      );
  }
}