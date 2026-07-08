import { Component, inject } from '@angular/core';
import { ChatbotStateService } from '../../../../shared/components/chatbot/chatbot-state.service';

@Component({
  selector: 'app-inventory-officer-navbar',
  imports: [],
  templateUrl: './inventory-officer-navbar.html',
  styleUrl: './inventory-officer-navbar.css',
})
export class InventoryOfficerNavbar {
  private readonly chatbotState = inject(ChatbotStateService);

  openChatbot(): void {
    this.chatbotState.open();
  }
}

