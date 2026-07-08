import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { VendorSidebar } from '../../../features/Vendor-Admin/shared/vendor-sidebar/vendor-sidebar';
import { VendorNavbar } from '../../../features/Vendor-Admin/shared/vendor-navbar/vendor-navbar';
import { ToastHostComponent } from '../../../features/Vendor-Admin/shared/toast-host/toast-host.component';

@Component({
  selector: 'app-vendor-layout',
  imports: [RouterOutlet,VendorSidebar,VendorNavbar,ToastHostComponent],
  templateUrl: './vendor-layout.html',
  styleUrl: './vendor-layout.css',
})
export class VendorLayout  {

}

