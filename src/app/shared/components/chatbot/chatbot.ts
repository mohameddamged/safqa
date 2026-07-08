import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import {
  AiChatBotService,
  AiChatBotMessageDto,
} from '../../../core/services/ai-chatbot.service';
import { ChatbotStateService } from './chatbot-state.service';

interface ChatMessage {
  role:      'User' | 'AI';
  content:   string;
  createdAt: string;
  isLoading?: boolean;
}

@Component({
  selector:    'app-chatbot',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl:    './chatbot.css',
})
export class Chatbot implements OnInit {
  private readonly chatbotService   = inject(AiChatBotService);
  private readonly authService      = inject(AuthService);
  private readonly chatbotState     = inject(ChatbotStateService);

  @ViewChild('messagesContainer') private messagesRef!: ElementRef<HTMLDivElement>;

  // isOpen is now driven by the shared service — navbar button controls it
  readonly isOpen           = this.chatbotState.isOpen;
  readonly messages         = signal<ChatMessage[]>([]);
  readonly inputText        = signal('');
  readonly isSending        = signal(false);
  readonly isLoadingHistory = signal(false);
  readonly historyLoaded    = signal(false);

  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  constructor() {
    // When chatbot opens, load history and scroll
    effect(() => {
      if (this.isOpen() && !this.historyLoaded() && this.isAuthenticated()) {
        this.loadHistory();
      }
      if (this.isOpen()) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  ngOnInit(): void {}

  toggle(): void  { this.chatbotState.toggle(); }
  close():  void  { this.chatbotState.close();  }

  // GET /api/AiChatBot/history
  private loadHistory(): void {
    this.isLoadingHistory.set(true);
    this.chatbotService.getHistory().subscribe({
      next: (res) => {
        this.isLoadingHistory.set(false);
        this.historyLoaded.set(true);
        if (res?.success && res.data?.length) {
          this.messages.set(
            res.data.map((m: AiChatBotMessageDto) => ({
              role:      m.role,
              content:   m.content ?? '',
              createdAt: m.createdAt,
            }))
          );
          setTimeout(() => this.scrollToBottom(), 50);
        }
      },
      error: () => {
        this.isLoadingHistory.set(false);
        this.historyLoaded.set(true);
      },
    });
  }

  // POST /api/AiChatBot/send
  sendMessage(): void {
    const text = this.inputText().trim();
    if (!text || this.isSending()) return;

    const now = new Date().toISOString();
    this.messages.update(msgs => [...msgs, { role: 'User', content: text, createdAt: now }]);
    this.inputText.set('');
    this.isSending.set(true);
    this.messages.update(msgs => [...msgs, { role: 'AI', content: '', createdAt: now, isLoading: true }]);
    setTimeout(() => this.scrollToBottom(), 50);

    this.chatbotService.send(text).subscribe({
      next: (res) => {
        this.isSending.set(false);
        const reply = res?.data?.reply ?? 'Sorry, I could not process your request.';
        this.messages.update(msgs => {
          const updated = [...msgs];
          const idx = updated.map(m => m.isLoading).lastIndexOf(true);
          if (idx !== -1) updated[idx] = { role: 'AI', content: reply, createdAt: new Date().toISOString() };
          return updated;
        });
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: () => {
        this.isSending.set(false);
        this.messages.update(msgs => {
          const updated = [...msgs];
          const idx = updated.map(m => m.isLoading).lastIndexOf(true);
          if (idx !== -1) updated[idx] = { role: 'AI', content: 'Something went wrong. Please try again.', createdAt: new Date().toISOString() };
          return updated;
        });
        setTimeout(() => this.scrollToBottom(), 50);
      },
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  updateInput(value: string): void { this.inputText.set(value); }

  formatTime(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  private scrollToBottom(): void {
    const el = this.messagesRef?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
