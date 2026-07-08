import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { SystemAdminNavbar } from '../../../features/System-Admin/shared/system-admin-navbar/system-admin-navbar';
import { SystemAdminSidebar } from '../../../features/System-Admin/shared/system-admin-sidebar/system-admin-sidebar';


@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet,SystemAdminNavbar, SystemAdminSidebar],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {}
