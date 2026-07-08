import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PoService } from '../../../core/services/Company-Manager/PoService/po-service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-po-details',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './po-details.html',
})
export class PoDetails implements OnInit {
  private poService = inject(PoService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  rfqTitle = signal<string>('');

  poId = signal<number | null>(null);
  poForm!: FormGroup;

  constructor() {
    this.poForm = this.fb.group({
      itemName: [''],
      categoryName: [''],
      quantity: [''],
      unit: [''],
      technicalSpecs: [''],
      reason: [''], 
      additionalNotes: [''],
      totalCost: [''],
      currency: [''],
      deadline: [''],
      status: ['']
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.poId.set(Number(id));
      this.loadPoDetails(Number(id));
    }
  }

  loadPoDetails(id: number) {
    this.poService.getPurchaseOrderById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const d = res.data;
          this.rfqTitle.set(d.rfqTitle);
          this.poForm.patchValue({
            itemName: d.itemName,
            categoryName: d.categoryName,
            quantity: d.quantity,
            unit: d.unit,
            technicalSpecs: d.technicalSpecification,
            reason: d.rfqTitle,
            additionalNotes: d.additionalNotes,
            totalCost: d.totalCost,
            currency: d.currency,
            deadline: new Date(d.deliveryDeadline).toLocaleDateString(),
            status: d.status
          });
        }
      },
      error: (err) => console.error('Error:', err)
    });
  }
}