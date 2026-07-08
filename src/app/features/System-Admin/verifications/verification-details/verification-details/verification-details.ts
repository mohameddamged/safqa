import { Component,  OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VerificationService } from '../../../../../core/services/System-Admin/verification-service/verification-service';


@Component({
  selector: 'app-verification-details',
  imports: [RouterLink],
  templateUrl: './verification-details.html',
  styleUrl: './verification-details.css',
})
export class VerificationDetails implements OnInit {
  type: 'companies' | 'vendors' = 'companies';
  id!: number;
  data = signal<any>(null);
  showRejectModal = signal(false);
  rejectionReason = signal('');


  constructor(
    private route: ActivatedRoute,
    private verificationService: VerificationService,
    private router: Router
  ) { }

  ngOnInit() {
    this.type = this.route.snapshot.params['type'];
    this.id = +this.route.snapshot.params['id'];
    this.loadDetails();
  }

  loadDetails() {
    this.verificationService.getDetails(this.type, this.id).subscribe(res => {
      if (res.success) this.data.set(res.data);
    });
  }

  onApprove() {
    this.verificationService.approve(this.type, this.id).subscribe(() => {
      this.router.navigate(['/system-admin/verifications', this.type]);
    });
  }

  onRejectClick() {
    this.showRejectModal.set(true);
  }

  updateReason(value: string) {
    this.rejectionReason.set(value);
  }

  confirmReject() {
  const reason = this.rejectionReason();
  
  if (!reason || reason.trim() === '') {
    alert('الرجاء كتابة سبب الرفض');
    return;
  }

  this.verificationService.reject(this.type, this.id, reason).subscribe({
    next: () => {
      this.showRejectModal.set(false);
      this.router.navigate(['/system-admin/verifications', this.type]);
    },
    error: (err) => {
      console.error('Error:', err);
      alert('حدث خطأ أثناء الاتصال بالسيرفر');
    }
  });
}
}