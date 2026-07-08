import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, DecimalPipe, NgStyle } from '@angular/common';
import { EscrowService } from '../../../../core/services/System-Admin/escrow-service/escrow-service';

export interface CompanyReturnedFundDto {
  purchaseOrderId: number;
  vendorName:      string | null;
  companyName:     string | null;
  returnedFund:    number;
  deliveryDate:    string | null;
  transactionStatus: string | null;
}

@Component({
  selector:    'app-returned-funds',
  standalone:  true,
  imports:     [DatePipe, DecimalPipe, NgStyle],
  templateUrl: './returned-funds.html',
  styleUrl:    './returned-funds.css',
})
export class ReturnedFunds implements OnInit {

  items      = signal<CompanyReturnedFundDto[]>([]);
  isLoading  = signal(true);
  errorMsg   = signal('');

  pageNumber  = signal(1);
  pageSize    = 10;
  totalPages  = signal(1);
  totalCount  = signal(0);

  constructor(
    private readonly escrowService: EscrowService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadPage(1);
  }

  // GET /api/SystemAdmin/returned-funds?pageNumber=&pageSize=
  loadPage(page: number): void {
    this.isLoading.set(true);
    this.errorMsg.set('');
    this.escrowService.getReturnedFunds({ pageNumber: page, pageSize: this.pageSize }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.items.set(res.data.items ?? []);
          this.pageNumber.set(res.data.pageNumber);
          this.totalPages.set(res.data.totalPages);
          this.totalCount.set(res.data.totalCount);
        } else {
          this.errorMsg.set(res.message || 'Failed to load returned funds.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMsg.set('Failed to load returned funds. Please try again.');
      },
    });
  }

  prevPage(): void {
    if (this.pageNumber() > 1) this.loadPage(this.pageNumber() - 1);
  }

  nextPage(): void {
    if (this.pageNumber() < this.totalPages()) this.loadPage(this.pageNumber() + 1);
  }

  goToDetails(item: CompanyReturnedFundDto): void {
    this.router.navigate(
      ['/system-admin/escrow-payments/returned-funds', item.purchaseOrderId],
      { state: item },
    );
  }

  isValidDate(d: string | null | undefined): boolean {
    if (!d) return false;
    const dt = new Date(d);
    return !isNaN(dt.getTime()) && dt.getFullYear() > 1;
  }

  statusStyle(status: string | null) {
    const s = status ?? '';
    return {
      'background-color':
        s === 'Transferred'  ? '#DBFFDD' :
        s === 'Pending'      ? '#FCF1ED' :
        s === 'Rejected'     ? '#FEDCDD' : '#E5E7EB',
      color:
        s === 'Transferred'  ? '#00B209' :
        s === 'Pending'      ? '#E47C55' :
        s === 'Rejected'     ? '#FC161A' : '#6B7280',
    };
  }
}
