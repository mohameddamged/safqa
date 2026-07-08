import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProcurementOfficerNavbar } from '../Shared/procurement-officer-navbar/procurement-officer-navbar';
import { ProcurementOfficerSidebar } from '../Shared/procurement-officer-sidebar/procurement-officer-sidebar';

@Component({
  selector: 'app-procurement-officer-layout',
  imports: [RouterOutlet,ProcurementOfficerNavbar,ProcurementOfficerSidebar],
  templateUrl: './procurement-officer-layout.html',
  styleUrl: './procurement-officer-layout.css',
})
export class ProcurementOfficerLayout {}
