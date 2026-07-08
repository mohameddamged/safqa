import { Component, signal } from '@angular/core';
import { AdminService } from '../../../../core/services/admin-service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-vendor-details',
  imports: [DatePipe,NgClass],
  templateUrl: './vendor-details.html',
  styleUrl: './vendor-details.css',
})
export class VendorDetails {
   data = signal<any>(null);
  isLoading = signal(true);
  
  constructor(
    private route: ActivatedRoute, 
    private adminService: AdminService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDetails(id);
  }

  loadDetails(id: number) {
    this.adminService.getDetails('vendors', id).subscribe(res => {
      this.data.set(res.data);
      this.isLoading.set(false);
    });
  }
}
