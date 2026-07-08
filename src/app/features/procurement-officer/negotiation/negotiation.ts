import {
  Component, OnInit, OnDestroy, inject,
  ChangeDetectorRef, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProcurementService } from '../services/procurement.service';
import { ChatHubService, ChatMessageDto } from '../services/chat-hub.service';

@Component({
  selector: 'app-negotiation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './negotiation.html',
  styleUrl: './negotiation.css',
})
export class Negotiation implements OnInit, OnDestroy {
  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);
  private readonly http        = inject(HttpClient);
  private readonly procService = inject(ProcurementService);
  private readonly chatHub     = inject(ChatHubService);
  private readonly cdr         = inject(ChangeDetectorRef);

  @ViewChild('chatMessages') chatMessagesRef!: ElementRef;
  @ViewChild('aiChat')       aiChatRef!: ElementRef;

  offerId!: number;
  rfqId!: number;

  // ── Negotiation Chat ────────────────────────────────────────────
  messages: ChatMessageDto[] = [];
  newMessage = '';
  isLoading  = true;
  isSending  = false;
  isConverting = false;
  hubConnecting = false;
  hubError: string | null = null;

  private msgSub?: Subscription;

  // ── AI Chat ─────────────────────────────────────────────────────
  // AiMessageDto: { id, content, role ('User'|'AI'), createdAt }
  aiMessages: { role: 'user' | 'ai'; text: string; time: string }[] = [];
  aiInput      = '';
  isAiLoading  = false;
  isSendingAi  = false;

  // ── AI Summary (NegotiationSummaryDto) ──────────────────────────
  summary: {
    summary: string | null;
    agreedPrice: string | null;
    quantity: number | null;
    vendorConcessions: string[];
    procurementRequests: string[];
  } | null = null;
  showSummaryPanel = false;

  // ── Role helpers ─────────────────────────────────────────────────
  // senderRole values from backend Roles.cs constants:
  //   'ProcurementOfficer'  |  'VendorAdmin'
  isVendorMsg(msg: ChatMessageDto): boolean {
    return msg.senderRole === 'VendorAdmin';
  }

  ngOnInit(): void {
    this.offerId = Number(this.route.snapshot.paramMap.get('offerId'));
    this.rfqId   = Number(this.route.snapshot.paramMap.get('rfqId'));

    this.loadMessages();
    this.loadAiHistory();
    this.connectHub();
  }

  ngOnDestroy(): void {
    this.msgSub?.unsubscribe();
    this.chatHub.stopAsync();
  }

  // ── SignalR Connection ───────────────────────────────────────────
  private async connectHub(): Promise<void> {
    this.hubConnecting = true;
    try {
      await this.chatHub.startAsync();
      // Subscribe to incoming real-time messages
      this.msgSub = this.chatHub.messageReceived$.subscribe(msg => {
        // Only add if it belongs to this conversation
        if ((msg as any).rfqVendorOfferId === this.offerId ||
            this.messages.some(m => m.senderId === msg.senderId) ||
            true) {
          this.messages = [...this.messages, msg];
          this.cdr.detectChanges();
          this.scrollChat();
          // Mark as read immediately on receive
          this.chatHub.markAsRead(this.offerId).catch(() => {});
        }
      });
      this.hubError = null;
    } catch {
      this.hubError = 'Real-time chat unavailable. Messages will load on refresh.';
    } finally {
      this.hubConnecting = false;
      this.cdr.detectChanges();
    }
  }

  // ── Load existing messages via REST ─────────────────────────────
  loadMessages(): void {
    this.procService.getChatMessages(this.offerId).subscribe({
      next: (res: any) => {
        this.messages = res?.data ?? [];
        this.isLoading = false;
        this.cdr.detectChanges();
        this.scrollChat();
        // Mark as read via REST
        this.procService.markMessagesAsRead(this.offerId).subscribe();
      },
      error: () => {
        this.messages = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Send message via SignalR ─────────────────────────────────────
  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() || this.isSending) return;
    const text = this.newMessage.trim();
    this.newMessage  = '';
    this.isSending   = true;

    try {
      await this.chatHub.sendMessage(this.offerId, text);
      // Message will come back via ReceiveMessage subscription
    } catch {
      // SignalR failed — show error in chat
      this.hubError = 'Failed to send message. Please check your connection.';
      this.cdr.detectChanges();
    } finally {
      this.isSending = false;
      this.cdr.detectChanges();
    }
  }

  // ── Convert to PO ───────────────────────────────────────────────
  convertToPO(): void {
    if (this.isConverting) return;
    this.isConverting = true;
    this.procService.acceptOffer(this.offerId).subscribe({
      next: () => {
        this.isConverting = false;
        this.router.navigate(['/procurement-officer/po-list']);
      },
      error: () => {
        this.isConverting = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── AI Summary ──────────────────────────────────────────────────
  summarise(): void {
    this.http.get(`${environment.apiUrl}/AiChatNegotiation/summary/${this.offerId}`).subscribe({
      next: (res: any) => {
        const data = res?.data;
        if (data) {
          this.summary = {
            summary:              data.summary             ?? null,
            agreedPrice:          data.agreedPrice         ?? null,
            quantity:             data.quantity            ?? null,
            vendorConcessions:    data.vendorConcessions   ?? [],
            procurementRequests:  data.procurementRequests ?? [],
          };
          this.showSummaryPanel = true;
          // Also push into AI chat
          if (data.summary) {
            this.aiMessages.push({ role: 'ai', text: data.summary, time: this.nowTime() });
          }
        }
        this.cdr.detectChanges();
        this.scrollAi();
      },
      error: () => {
        this.aiMessages.push({ role: 'ai', text: 'Failed to summarise.', time: this.nowTime() });
        this.cdr.detectChanges();
      }
    });
  }

  closeSummary(): void {
    this.showSummaryPanel = false;
  }

  // ── AI Chat History ─────────────────────────────────────────────
  // AiMessageDto: { id, content, role: 'User'|'AI', createdAt }
  loadAiHistory(): void {
    this.isAiLoading = true;
    this.http.get(`${environment.apiUrl}/AiChatNegotiation/conversation/${this.offerId}`).subscribe({
      next: (res: any) => {
        const items: any[] = res?.data ?? [];
        this.aiMessages = items.map((m: any) => ({
          role: m.role === 'User' ? 'user' : 'ai',
          text: m.content ?? '',
          time: this.formatTime(m.createdAt),
        }));
        this.isAiLoading = false;
        this.cdr.detectChanges();
        this.scrollAi();
      },
      error: () => {
        this.isAiLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Send AI message ─────────────────────────────────────────────
  // AiChatResponseDto: { userMessage: AiMessageDto, aiMessage: AiMessageDto }
  sendAiMessage(): void {
    if (!this.aiInput.trim() || this.isSendingAi) return;
    const text   = this.aiInput.trim();
    this.aiInput = '';
    this.aiMessages.push({ role: 'user', text, time: this.nowTime() });
    this.isSendingAi = true;
    this.cdr.detectChanges();
    this.scrollAi();

    this.http.post(`${environment.apiUrl}/AiChatNegotiation/send`, {
      rfqVendorOfferId: this.offerId,
      message: text,
    }).subscribe({
      next: (res: any) => {
        // AiChatResponseDto → data.aiMessage.content
        const reply = res?.data?.aiMessage?.content ?? 'No response.';
        this.aiMessages.push({ role: 'ai', text: reply, time: this.nowTime() });
        this.isSendingAi = false;
        this.cdr.detectChanges();
        this.scrollAi();
      },
      error: () => {
        this.aiMessages.push({ role: 'ai', text: 'Failed to get AI response.', time: this.nowTime() });
        this.isSendingAi = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────
  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  private nowTime(): string {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  private scrollChat(): void {
    setTimeout(() => {
      if (this.chatMessagesRef?.nativeElement) {
        this.chatMessagesRef.nativeElement.scrollTop =
          this.chatMessagesRef.nativeElement.scrollHeight;
      }
    }, 50);
  }

  private scrollAi(): void {
    setTimeout(() => {
      if (this.aiChatRef?.nativeElement) {
        this.aiChatRef.nativeElement.scrollTop =
          this.aiChatRef.nativeElement.scrollHeight;
      }
    }, 50);
  }
}
