import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ── DTOs (from Swagger) ───────────────────────────────────────────────────

export type AiMessageRole = 'User' | 'AI';

export interface AiChatBotMessageDto {
  id:        number;
  content:   string | null;
  role:      AiMessageRole;
  createdAt: string;
}

export interface AiChatBotRequestDto {
  message: string;
}

export interface AiChatBotResponseDto {
  reply: string | null;
}

export interface AiChatBotHistoryResult {
  success: boolean;
  message: string | null;
  data:    AiChatBotMessageDto[];
}

export interface AiChatBotSendResult {
  success: boolean;
  message: string | null;
  data:    AiChatBotResponseDto;
}

// ── Service ───────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AiChatBotService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/AiChatBot`;

  /**
   * GET /api/AiChatBot/history
   * Returns the full conversation history for the authenticated user.
   * Auth is handled automatically by auth.interceptor.ts
   */
  getHistory(): Observable<AiChatBotHistoryResult> {
    return this.http.get<AiChatBotHistoryResult>(`${this.baseUrl}/history`);
  }

  /**
   * POST /api/AiChatBot/send
   * Sends a message to the AI chatbot and returns the AI reply.
   * Body: AiChatBotRequestDto { message: string }
   * Response: AiChatBotResponseDto { reply: string }
   */
  send(message: string): Observable<AiChatBotSendResult> {
    const body: AiChatBotRequestDto = { message };
    return this.http.post<AiChatBotSendResult>(`${this.baseUrl}/send`, body);
  }
}
