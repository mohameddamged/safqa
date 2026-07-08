import { Component, inject } from '@angular/core';
import { ChatbotStateService } from '../../../../shared/components/chatbot/chatbot-state.service';

@Component({
  selector: 'app-procurement-officer-navbar',
  imports: [],
  templateUrl: './procurement-officer-navbar.html',
  styleUrl: './procurement-officer-navbar.css',
})
export class ProcurementOfficerNavbar {
  private readonly chatbotState = inject(ChatbotStateService);

  openChatbot(): void {
    this.chatbotState.open();
  }
}
