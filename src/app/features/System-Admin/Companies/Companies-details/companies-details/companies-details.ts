import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../../../../core/services/System-Admin/admin-service/admin-service';

@Component({
  selector: 'app-companies-details',
  imports: [RouterLink,DatePipe],
  templateUrl: './companies-details.html',
  styleUrl: './companies-details.css',
})
export class CompaniesDetails implements OnInit{
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
    this.adminService.getDetails('companies', id).subscribe(res => {
      this.data.set(res.data);
      this.isLoading.set(false);
    });
  }
}
