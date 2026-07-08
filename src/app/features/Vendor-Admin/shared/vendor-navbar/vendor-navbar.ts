import { Component, inject } from '@angular/core';
import { ChatbotStateService } from '../../../../shared/components/chatbot/chatbot-state.service';

@Component({
  selector: 'app-vendor-navbar',
  imports: [],
  templateUrl: './vendor-navbar.html',
  styleUrl: './vendor-navbar.css',
})
export class VendorNavbar {
  private readonly chatbotState = inject(ChatbotStateService);

  openChatbot(): void {
    this.chatbotState.open();
  }
}

