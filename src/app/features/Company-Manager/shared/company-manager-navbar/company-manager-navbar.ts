import { Component, inject } from '@angular/core';
import { ChatbotStateService } from '../../../../shared/components/chatbot/chatbot-state.service';

@Component({
  selector: 'app-company-manager-navbar',
  imports: [],
  templateUrl: './company-manager-navbar.html',
  styleUrl: './company-manager-navbar.css',
})
export class CompanyManagerNavbar {
  private readonly chatbotState = inject(ChatbotStateService);

  openChatbot(): void {
    this.chatbotState.open();
  }
}
