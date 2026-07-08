import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload-pr',
  imports: [],
  templateUrl: './upload-pr.html',
  styleUrl: './upload-pr.css',
})
export class UploadPr {
  constructor(private router: Router) {}

  makePurchaseRequisition() {
    this.router.navigate(['/department-manager/upload-pr/create']);
  }
}
