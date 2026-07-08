import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InventoryOfficerNavbar } from '../../../features/Inventory-Officer/shared/inventory-officer-navbar/inventory-officer-navbar';
import { InventoryOfficerSidebar } from '../../../features/Inventory-Officer/shared/inventory-officer-sidebar/inventory-officer-sidebar';

@Component({
  selector: 'app-inventory-layout',
  imports: [RouterOutlet,InventoryOfficerNavbar,InventoryOfficerSidebar],
  templateUrl: './inventory-layout.html',
  styleUrl: './inventory-layout.css',
})
export class InventoryLayout {}
