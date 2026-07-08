import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastHost } from './shared/components/toast/toast';
import { Chatbot } from './shared/components/chatbot/chatbot';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastHost,Chatbot],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}