import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from "./shared/Components/sidebar/sidebar";
import { Navbar} from "./shared/Components/navbar/navbar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar,  Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('safka');
}
