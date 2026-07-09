import { Component, inject, Input } from '@angular/core';
import { ChatbotStateService } from '../../../../shared/components/chatbot/chatbot-state.service';

@Component({
  selector: 'app-procurement-officer-navbar',
  imports: [],
  templateUrl: './procurement-officer-navbar.html',
  styleUrl: './procurement-officer-navbar.css',
})
export class ProcurementOfficerNavbar {
  private readonly chatbotState = inject(ChatbotStateService);

  @Input() showSearch: boolean = true;

  openChatbot(): void {
    this.chatbotState.open();
  }
}
