import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RfqsService, ApiRfqDetail } from '../../../core/services/Vendor-Admin/rfqs.service';
import { OffersService } from '../../../core/services/Vendor-Admin/offers.service';

export interface RfqDetail {
  id: string;
  title: string;
  itemName: string;
  category: string;
  quantity: string;
  unitOfMeasurement: string;
  technicalSpecs: string;
  additionalNotes: string;
  rfqDeadline: string;
  deliveryDeadline: string;
  country: string;
  stateRegion: string;
  city: string;
  street: string;
  fullCompanyAddress: string;
  notesToVendor: string;
}

@Component({
  selector: 'app-rfq-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rfq-details.component.html',
  styleUrls: ['./rfq-details.component.css']
})
export class RfqDetailsComponent implements OnInit, OnDestroy {

  rfq: RfqDetail | null = null;
  loading = true;
  errorMessage = '';
  /** True when we already know an offer was submitted for this RFQ —
   *  in that case "Apply An Offer" shouldn't be offered again. */
  hasExistingOffer = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rfqsService: RfqsService,
    private offersService: OffersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.hasExistingOffer = this.route.snapshot.queryParamMap.get('hasOffer') === '1';

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.rfq = null;
        this.errorMessage = '';
        this.loading = true;

        const id = params.get('id');
        if (!id) {
          this.loading = false;
          this.errorMessage = 'RFQ ID is missing.';
          return;
        }

        if (!this.hasExistingOffer) {
          this.offersService.getMySubmittedOffers().subscribe({
            next: (offers) => {
              this.hasExistingOffer = offers.some(o => String(o.rfqId) === String(id));
              try { this.cdr.markForCheck(); } catch { /* noop */ }
            },
            error: () => { /* silently ignore — button stays visible */ }
          });
        }

        this.rfqsService.getRfqDetails(id).subscribe({
          next: (res) => {
            if (!res.success || !res.data) {
              this.errorMessage = res.message || 'Failed to load RFQ details.';
              this.rfq = null;
              this.loading = false;
              this.cdr.markForCheck();
              return;
            }

            this.rfq = this.mapApiDetail(res.data);
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.loading = false;
            this.errorMessage = 'Failed to load RFQ details. Please try again.';
            this.cdr.markForCheck();
          }
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private mapApiDetail(data: ApiRfqDetail): RfqDetail {
    return {
      id: String(data.rfqId),
      title: data.rfqTitle,
      itemName: data.itemName,
      category: data.categoryName,
      quantity: String(data.quantity),
      unitOfMeasurement: data.unit,
      technicalSpecs: '',
      additionalNotes: data.additionalNotes,
      rfqDeadline: data.rfqDeadline,
      deliveryDeadline: data.deliveryDeadline,
      country: data.country,
      stateRegion: data.stateRegion,
      city: data.city,
      street: data.streetNumber,
      fullCompanyAddress: data.fullAddress,
      notesToVendor: data.notesToVendors,
    };
  }

  goBack(): void {
    this.router.navigate(['/vendor-admin/rfqs']);
  }

  onApplyOffer(): void {
    if (!this.rfq) {
      return;
    }
    this.router.navigate(['/vendor-admin/rfqs', this.rfq.id, 'apply-offer']);
  }
}
