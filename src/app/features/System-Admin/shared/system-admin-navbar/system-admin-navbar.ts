import { Component, inject } from '@angular/core';
import { ChatbotStateService } from '../../../../shared/components/chatbot/chatbot-state.service';

@Component({
  selector: 'app-system-admin-navbar',
  imports: [],
  templateUrl: './system-admin-navbar.html',
  styleUrl: './system-admin-navbar.css',
})
export class SystemAdminNavbar {
  private readonly chatbotState = inject(ChatbotStateService);

  openChatbot(): void {
    this.chatbotState.open();
  }
}
