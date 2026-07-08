import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PrService } from '../../../core/services/Company-Manager/pr-service';

@Component({
  selector: 'app-pr-details',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './pr-details.html',
  styleUrl: './pr-details.css',
})
export class PrDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private prService = inject(PrService);

  prId = signal<string | null>(null);

  prForm = this.fb.group({
    itemName: [''],
    category: [''],
    quantity: [''],
    unitOfMeasurement: [''],
    technicalSpecs: [''],
    reason: [''],
    additionalNotes: [''],
    estimatedCost: [''],
    currency: [''],
    aiEstimatedCost: [''],
    deadline: ['']
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.prId.set(id);

    if (id) {
      this.prService.getPrDetails(id).subscribe((res: any) => {
        if (res.success) {
          const data = res.data;
          this.prForm.patchValue({
            itemName: data.itemName,
            category: data.category,
            quantity: data.quantity,
            unitOfMeasurement: data.unit,
            technicalSpecs: data.technicalSpecifications,
            reason: data.reason,
            additionalNotes: data.additionalNotes,
            estimatedCost: data.estimatedPrice,
            currency: data.currency,
            aiEstimatedCost: `${data.estimatedPrice} ${data.currency}`, 
            deadline: new Date(data.requiredDeliveryDate).toLocaleDateString()
          });
          this.prForm.disable();
        }
      });
    }
  }

  onAccept() {
    const id = this.prId();
    if (id) {
      this.prService.approvePr(id, 'Approved').subscribe(() => {
        // alert(' Approved ');
        this.router.navigate(['/Company-manager/pr-list']);
      });
    }
  }

  onReject() {
    const id = this.prId();
    if (id) {
      this.prService.rejectPr(id, 'Rejected').subscribe(() => {
        // alert('Rejected ');
        this.router.navigate(['/Company-manager/pr-list']);
      });
    }
  }
}