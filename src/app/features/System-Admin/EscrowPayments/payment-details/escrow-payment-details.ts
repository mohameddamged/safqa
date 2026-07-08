import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgStyle } from '@angular/common';
import { EscrowService } from '../../../../core/services/System-Admin/escrow-service/escrow-service';

@Component({
  selector: 'app-escrow-payment-details',
  imports: [RouterLink, DatePipe, NgStyle],
  templateUrl: './escrow-payment-details.html',
  styleUrl: './escrow-payment-details.css',
})
export class EscrowPaymentDetails implements OnInit {
  poId!: number;

  // بيانات القائمة (List) اللي جاية من صفحة الـ Companies عن طريق router state
  listItem = signal<any>(null);

  // بيانات التفاصيل (Details) اللي جاية من GET /api/SystemAdmin/{poId}/details
  data = signal<any>(null);

  isLoading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private escrowService: EscrowService
  ) {}

  ngOnInit() {
    this.poId = +this.route.snapshot.params['id'];

    // بناخد الداتا اللي اتبعتت من صفحة القائمة (اسم الشركة، المبلغ، العملة، تاريخ الدفع، الـ status)
    const stateData = history.state;
    this.listItem.set(stateData && stateData.status ? stateData : null);

    this.loadDetails();
  }

  loadDetails() {
    this.isLoading.set(true);
    this.escrowService.getDetails(this.poId).subscribe({
      next: (res) => {
        if (res.success) {
          this.data.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  // status المعتمد لإظهار الأزرار من عدمه: بييجي من صفحة القائمة (list) الأول،
  // ولو مفيش (يعني المستخدم فتح اللينك مباشرة) بنرجع لـ transactionStatus من details
  get status(): string {
    return this.listItem()?.status ?? this.data()?.transactionStatus ?? '';
  }

  get isPending(): boolean {
    return this.status?.toLowerCase() === 'pending';
  }

  get statusStyle() {
    const s = this.status;
    return {
      'background-color':
        s === 'Approved' ? '#DBFFDD' : s === 'Pending' ? '#FCF1ED' : s === 'Rejected' ? '#FEDCDD' : '#E5E7EB',
      color: s === 'Approved' ? '#00B209' : s === 'Pending' ? '#E47C55' : s === 'Rejected' ? '#FC161A' : '#6B7280',
    };
  }
}
