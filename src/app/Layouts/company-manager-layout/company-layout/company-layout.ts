import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CompanyManagerNavbar } from '../../../features/Company-Manager/shared/company-manager-navbar/company-manager-navbar';
import { CompanyManagerSidebar } from '../../../features/Company-Manager/shared/company-manager-sidebar/company-manager-sidebar';

@Component({
  selector: 'app-company-layout',
  imports: [RouterOutlet,CompanyManagerNavbar,CompanyManagerSidebar],
  templateUrl: './company-layout.html',
  styleUrl: './company-layout.css',
})
export class CompanyLayout {}
