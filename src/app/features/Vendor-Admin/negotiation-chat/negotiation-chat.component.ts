// import {
//   Component, OnInit, OnDestroy,
//   ViewChild, ElementRef
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router, ActivatedRoute } from '@angular/router';
// import { HttpClient } from '@angular/common/http';
// import { Subscription } from 'rxjs';
// import { environment } from '../../../../environments/environment';
// import { ChatHubService, ChatMessageDto } from '../../procurement-officer/services/chat-hub.service';

// interface AiMessage {
//   role: 'user' | 'ai';
//   text: string;
//   time: string;
// }

// @Component({
//   selector: 'app-negotiation-chat',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './negotiation-chat.component.html',
//   styleUrls: ['./negotiation-chat.component.css']
// })
// export class NegotiationChatComponent implements OnInit, OnDestroy {

//   // rfqVendorOfferId — الـ id الحقيقي للـ offer (مش rfqId)
//   offerId!: number;

//   // Offer info (للعرض فقط)
//   rfqTitle   = '';
//   companyName = '';

//   // Chat
//   messages: ChatMessageDto[] = [];
//   messageText = '';
//   isLoading   = true;
//   isSending   = false;
//   hubError: string | null = null;

//   // AI Chat
//   // AiMessageDto: { id, content, role: 'User'|'AI', createdAt }
//   aiMessages: AiMessage[] = [];
//   aiText    = '';
//   aiLoading = false;

//   // Summary
//   summary: any = null;
//   showSummaryPanel = false;

//   private msgSub?: Subscription;


//   @ViewChild('messagesContainer')   private messagesContainer!: ElementRef;
//   @ViewChild('aiMessagesContainer') private aiMessagesContainer!: ElementRef;

//   constructor(
//     private router: Router,
//     private route: ActivatedRoute,
//     private http: HttpClient,
//     private chatHub: ChatHubService,
//   ) {}

//   ngOnInit(): void {
//     // الـ route: my-offers/NegotiationChat/:id
//     // الـ :id هو الـ offerId (rfqVendorOfferId) — مش rfqId
//     this.offerId = Number(this.route.snapshot.paramMap.get('id'));

//     // لو اتبعت offer state من الـ navigation استخدمه للعرض
//     const state = history.state as any;
//     if (state?.offer) {
//       this.rfqTitle    = state.offer.rfqTitle    ?? '';
//       this.companyName = state.offer.companyName ?? '';
//     }

//     this.loadMessages();
//     this.loadAiHistory();
//     this.connectHub();
//   }

//   ngOnDestroy(): void {
//     this.msgSub?.unsubscribe();
//     this.chatHub.stopAsync();
//   }

//   private scrollAll(): void {
//     setTimeout(() => {
//       this.scrollToBottom(this.messagesContainer);
//       this.scrollToBottom(this.aiMessagesContainer);
//     }, 50);
//   }

//   private scrollToBottom(ref: ElementRef | undefined): void {
//     try {
//       if (ref?.nativeElement)
//         ref.nativeElement.scrollTop = ref.nativeElement.scrollHeight;
//     } catch (_) {}
//   }

//   // ── SignalR ──────────────────────────────────────────────────
//   private async connectHub(): Promise<void> {
//     try {
//       await this.chatHub.startAsync();
//       this.msgSub = this.chatHub.messageReceived$.subscribe(msg => {
//         this.messages = [...this.messages, msg];
//         this.scrollAll();
//         // mark read
//         this.chatHub.markAsRead(this.offerId).catch(() => {});
//       });
//     } catch {
//       this.hubError = 'Real-time chat unavailable. Messages will load on refresh.';
//     }
//   }

//   // ── Load history via REST ────────────────────────────────────
//   loadMessages(): void {
//     this.http.get(`${environment.apiUrl}/Chat/conversation/${this.offerId}`).subscribe({
//       next: (res: any) => {
//         this.messages  = res?.data ?? [];
//         this.isLoading = false;
//         this.scrollAll();
//         // mark as read
//         this.http.put(`${environment.apiUrl}/Chat/conversation/${this.offerId}/read`, {}).subscribe();
//       },
//       error: () => {
//         this.messages  = [];
//         this.isLoading = false;
//       }
//     });
//   }

//   // ── Send via SignalR ─────────────────────────────────────────
//   async sendMessage(): Promise<void> {
//     const text = this.messageText.trim();
//     if (!text || this.isSending) return;
//     this.messageText = '';
//     this.isSending   = true;
//     try {
//       await this.chatHub.sendMessage(this.offerId, text);
//     } catch {
//       this.hubError = 'Failed to send. Check your connection.';
//     } finally {
//       this.isSending = false;
//     }
//   }

//   // ── AI history ───────────────────────────────────────────────
//   // AiMessageDto: { id, content, role: 'User'|'AI', createdAt }
//   loadAiHistory(): void {
//     this.http.get(`${environment.apiUrl}/AiChatNegotiation/conversation/${this.offerId}`).subscribe({
//       next: (res: any) => {
//         const items: any[] = res?.data ?? [];
//         this.aiMessages = items.map((m: any) => ({
//           role: m.role === 'User' ? 'user' : 'ai',
//           text: m.content ?? '',
//           time: this.formatTime(m.createdAt),
//         }));
//         this.scrollAll();
//       },
//       error: () => {}
//     });
//   }

//   // ── Send AI message ──────────────────────────────────────────
//   // AiChatResponseDto: { userMessage, aiMessage: { content } }
//   sendAiMessage(): void {
//     const text = this.aiText.trim();
//     if (!text || this.aiLoading) return;
//     this.aiMessages.push({ role: 'user', text, time: this.nowTime() });
//     this.aiText   = '';
//     this.aiLoading = true;
//     this.scrollAll();

//     this.http.post(`${environment.apiUrl}/AiChatNegotiation/send`, {
//       rfqVendorOfferId: this.offerId,
//       message: text,
//     }).subscribe({
//       next: (res: any) => {
//         const reply = res?.data?.aiMessage?.content ?? 'No response.';
//         this.aiMessages.push({ role: 'ai', text: reply, time: this.nowTime() });
//         this.aiLoading    = false;
//         this.scrollAll();
//       },
//       error: () => {
//         this.aiMessages.push({ role: 'ai', text: 'Failed to get AI response.', time: this.nowTime() });
//         this.aiLoading = false;
//       }
//     });
//   }

//   // ── AI Summary ───────────────────────────────────────────────
//   summarise(): void {
//     this.http.get(`${environment.apiUrl}/AiChatNegotiation/summary/${this.offerId}`).subscribe({
//       next: (res: any) => {
//         const data = res?.data;
//         if (data) {
//           this.summary = {
//             summary:             data.summary             ?? null,
//             agreedPrice:         data.agreedPrice         ?? null,
//             quantity:            data.quantity            ?? null,
//             vendorConcessions:   data.vendorConcessions   ?? [],
//             procurementRequests: data.procurementRequests ?? [],
//           };
//           this.showSummaryPanel = true;
//           if (data.summary)
//             this.aiMessages.push({ role: 'ai', text: data.summary, time: this.nowTime() });
//         }
//         this.scrollAll();
//       },
//       error: () => {
//         this.aiMessages.push({ role: 'ai', text: 'Failed to summarise.', time: this.nowTime() });
//       }
//     });
//   }

//   closeSummary(): void { this.showSummaryPanel = false; }

//   // ── Helpers ──────────────────────────────────────────────────
//   // senderRole من الـ backend: 'ProcurementOfficer' | 'VendorAdmin'
//   isVendorMsg(msg: ChatMessageDto): boolean {
//     return msg.senderRole === 'VendorAdmin';
//   }

//   insertConclusion(): void {
//     this.messageText = 'Based on the negotiation, we have reached a conclusion on the terms discussed.';
//   }

//   goBack(): void {
//     this.router.navigate(['/vendor-admin/my-offers']);
//   }

//   formatTime(dateStr: string): string {
//     if (!dateStr) return '';
//     const d = new Date(dateStr);
//     return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
//   }

//   private nowTime(): string {
//     const d = new Date();
//     return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
//   }
// }




import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ChatHubService, ChatMessageDto } from '../../procurement-officer/services/chat-hub.service';

interface AiMessage {
  role: 'user' | 'ai';
  text: string;
  time: string;
}

@Component({
  selector: 'app-negotiation-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './negotiation-chat.component.html',
  styleUrls: ['./negotiation-chat.component.css']
})
export class NegotiationChatComponent implements OnInit, OnDestroy {

  // rfqVendorOfferId — الـ id الحقيقي للـ offer (مش rfqId)
  offerId!: number;

  // Offer info (للعرض فقط)
  rfqTitle   = '';
  companyName = '';

  // Chat
  messages: ChatMessageDto[] = [];
  messageText = '';
  isLoading   = true;
  isSending   = false;
  hubError: string | null = null;

  // AI Chat
  // AiMessageDto: { id, content, role: 'User'|'AI', createdAt }
  aiMessages: AiMessage[] = [];
  aiText    = '';
  aiLoading = false;

  // Summary
  summary: any = null;
  showSummaryPanel = false;

  private msgSub?: Subscription;

  @ViewChild('messagesContainer')   private messagesContainer!: ElementRef;
  @ViewChild('aiMessagesContainer') private aiMessagesContainer!: ElementRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private chatHub: ChatHubService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // الـ route: my-offers/NegotiationChat/:id
    // الـ :id هو الـ offerId (rfqVendorOfferId) — مش rfqId
    this.offerId = Number(this.route.snapshot.paramMap.get('id'));

    // لو اتبعت offer state من الـ navigation استخدمه للعرض
    const state = history.state as any;
    if (state?.offer) {
      this.rfqTitle    = state.offer.rfqTitle    ?? '';
      this.companyName = state.offer.companyName ?? '';
    }

    this.loadMessages();
    this.loadAiHistory();
    this.connectHub();
  }

  ngOnDestroy(): void {
    this.msgSub?.unsubscribe();
    this.chatHub.stopAsync();
  }

  private scrollAll(): void {
    setTimeout(() => {
      this.scrollToBottom(this.messagesContainer);
      this.scrollToBottom(this.aiMessagesContainer);
    }, 50);
  }

  private scrollToBottom(ref: ElementRef | undefined): void {
    try {
      if (ref?.nativeElement)
        ref.nativeElement.scrollTop = ref.nativeElement.scrollHeight;
    } catch (_) {}
  }

  // ── SignalR ──────────────────────────────────────────────────
  private async connectHub(): Promise<void> {
    try {
      await this.chatHub.startAsync();
      this.msgSub = this.chatHub.messageReceived$.subscribe(msg => {
        this.messages = [...this.messages, msg];
        this.cdr.detectChanges();
        this.scrollAll();
        // mark read
        this.chatHub.markAsRead(this.offerId).catch(() => {});
      });
    } catch {
      this.hubError = 'Real-time chat unavailable. Messages will load on refresh.';
      this.cdr.detectChanges();
    }
  }

  // ── Load history via REST ────────────────────────────────────
  loadMessages(): void {
    this.http.get(`${environment.apiUrl}/Chat/conversation/${this.offerId}`).subscribe({
      next: (res: any) => {
        this.messages  = res?.data ?? [];
        this.isLoading = false;
        this.cdr.detectChanges();
        this.scrollAll();
        // mark as read
        this.http.put(`${environment.apiUrl}/Chat/conversation/${this.offerId}/read`, {}).subscribe();
      },
      error: () => {
        this.messages  = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Send via SignalR ─────────────────────────────────────────
  async sendMessage(): Promise<void> {
    const text = this.messageText.trim();
    if (!text || this.isSending) return;
    this.messageText = '';
    this.isSending   = true;
    try {
      await this.chatHub.sendMessage(this.offerId, text);
    } catch {
      this.hubError = 'Failed to send. Check your connection.';
    } finally {
      this.isSending = false;
      this.cdr.detectChanges();
    }
  }

  // ── AI history ───────────────────────────────────────────────
  // AiMessageDto: { id, content, role: 'User'|'AI', createdAt }
  loadAiHistory(): void {
    this.http.get(`${environment.apiUrl}/AiChatNegotiation/conversation/${this.offerId}`).subscribe({
      next: (res: any) => {
        const items: any[] = res?.data ?? [];
        this.aiMessages = items.map((m: any) => ({
          role: m.role === 'User' ? 'user' : 'ai',
          text: m.content ?? '',
          time: this.formatTime(m.createdAt),
        }));
        this.cdr.detectChanges();
        this.scrollAll();
      },
      error: () => {}
    });
  }

  // ── Send AI message ──────────────────────────────────────────
  // AiChatResponseDto: { userMessage, aiMessage: { content } }
  sendAiMessage(): void {
    const text = this.aiText.trim();
    if (!text || this.aiLoading) return;
    this.aiMessages.push({ role: 'user', text, time: this.nowTime() });
    this.aiText   = '';
    this.aiLoading = true;
    this.cdr.detectChanges();
    this.scrollAll();

    this.http.post(`${environment.apiUrl}/AiChatNegotiation/send`, {
      rfqVendorOfferId: this.offerId,
      message: text,
    }).subscribe({
      next: (res: any) => {
        const reply = res?.data?.aiMessage?.content ?? 'No response.';
        this.aiMessages.push({ role: 'ai', text: reply, time: this.nowTime() });
        this.aiLoading    = false;
        this.cdr.detectChanges();
        this.scrollAll();
      },
      error: () => {
        this.aiMessages.push({ role: 'ai', text: 'Failed to get AI response.', time: this.nowTime() });
        this.aiLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── AI Summary ───────────────────────────────────────────────
  summarise(): void {
    this.http.get(`${environment.apiUrl}/AiChatNegotiation/summary/${this.offerId}`).subscribe({
      next: (res: any) => {
        const data = res?.data;
        if (data) {
          this.summary = {
            summary:             data.summary             ?? null,
            agreedPrice:         data.agreedPrice         ?? null,
            quantity:            data.quantity            ?? null,
            vendorConcessions:   data.vendorConcessions   ?? [],
            procurementRequests: data.procurementRequests ?? [],
          };
          this.showSummaryPanel = true;
          if (data.summary)
            this.aiMessages.push({ role: 'ai', text: data.summary, time: this.nowTime() });
        }
        this.cdr.detectChanges();
        this.scrollAll();
      },
      error: () => {
        this.aiMessages.push({ role: 'ai', text: 'Failed to summarise.', time: this.nowTime() });
        this.cdr.detectChanges();
      }
    });
  }

  closeSummary(): void {
    this.showSummaryPanel = false;
    this.cdr.detectChanges();
  }

  // ── Helpers ──────────────────────────────────────────────────
  // senderRole من الـ backend: 'ProcurementOfficer' | 'VendorAdmin'
  isVendorMsg(msg: ChatMessageDto): boolean {
    return msg.senderRole === 'VendorAdmin';
  }

  insertConclusion(): void {
    this.messageText = 'Based on the negotiation, we have reached a conclusion on the terms discussed.';
  }

  goBack(): void {
    this.router.navigate(['/vendor-admin/my-offers']);
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  private nowTime(): string {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
}
