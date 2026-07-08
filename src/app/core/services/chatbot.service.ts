import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ── DTOs matching backend exactly ────────────────────────────────────────────

export interface AiChatBotMessageDto {
  id:        number;
  content:   string | null;
  role:      'User' | 'AI';
  createdAt: string;
}

export interface AiChatBotRequestDto {
  message: string;
}

export interface AiChatBotResponseDto {
  reply: string | null;
}

export interface GeneralResult<T> {
  success: boolean;
  message: string | null;
  data:    T | null;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/AiChatBot`;

  /**
   * GET /api/AiChatBot/history
   * Returns the conversation history for the authenticated user.
   * Auth header is added automatically by the existing authInterceptor.
   */
  getHistory(): Observable<GeneralResult<AiChatBotMessageDto[]>> {
    return this.http.get<GeneralResult<AiChatBotMessageDto[]>>(
      `${this.baseUrl}/history`,
    );
  }

  /**
   * POST /api/AiChatBot/send
   * Sends a message and returns the AI reply.
   * Body: AiChatBotRequestDto { message }
   */
  send(message: string): Observable<GeneralResult<AiChatBotResponseDto>> {
    const body: AiChatBotRequestDto = { message };
    return this.http.post<GeneralResult<AiChatBotResponseDto>>(
      `${this.baseUrl}/send`,
      body,
    );
  }
}
