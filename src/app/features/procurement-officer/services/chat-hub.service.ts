import { Injectable, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../../environments/environment';
import { TokenStorageService } from '../../../core/services/token-storage.service';

export interface ChatMessageDto {
  id: number;
  senderId: string;
  senderName: string;
  senderRole: string;   // 'ProcurementOfficer' | 'VendorAdmin'
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  isSystemMessage: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatHubService implements OnDestroy {
  private readonly tokenStorage = inject(TokenStorageService);

  // Hub URL: backend registers at /chatHub
  // JWT comes from query string: ?access_token=TOKEN (configured in Program.cs)
  private readonly hubUrl = environment.apiUrl.replace('/api', '') + '/chatHub';

  private hubConnection: signalR.HubConnection | null = null;

  /** Emits every time the server pushes a new message via ReceiveMessage */
  readonly messageReceived$ = new Subject<ChatMessageDto>();

  /** Current connection state */
  get isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }

  async startAsync(): Promise<void> {
    if (this.isConnected) return;

    const token = this.tokenStorage.getAccessToken();

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => token ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Listen for incoming messages from the server (method: ReceiveMessage)
    this.hubConnection.on('ReceiveMessage', (msg: ChatMessageDto) => {
      this.messageReceived$.next(msg);
    });

    await this.hubConnection.start();
  }

  async stopAsync(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = null;
    }
  }

  /**
   * Send a chat message via SignalR.
   * Hub method: SendMessage({ RFQVendorOfferId, Content })
   */
  async sendMessage(rfqVendorOfferId: number, content: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('SignalR hub is not connected.');
    }
    await this.hubConnection!.invoke('SendMessage', {
      RFQVendorOfferId: rfqVendorOfferId,
      Content: content,
    });
  }

  /**
   * Mark messages as read via SignalR.
   * Hub method: MarkAsRead(rfqVendorOfferId)
   */
  async markAsRead(rfqVendorOfferId: number): Promise<void> {
    if (!this.isConnected) return;
    await this.hubConnection!.invoke('MarkAsRead', rfqVendorOfferId);
  }

  ngOnDestroy(): void {
    this.stopAsync();
    this.messageReceived$.complete();
  }
}
