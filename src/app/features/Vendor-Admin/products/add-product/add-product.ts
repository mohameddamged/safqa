import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../../core/services/Vendor-Admin/product-service';
import { Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../../core/services/System-Admin/category-service/category-service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-add-product',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct implements OnInit {
  productForm!: FormGroup;
  categories = signal<any[]>([]);
  units = ['Kg', 'Gram', 'Liter', 'Piece', 'Meter'];
  currencies = ['EGP', 'USD', 'SAR', 'EUR'];
  // selectedFile: File | null = null;
  // imagePreview = signal<string | null>(null);
  selectedFiles: File[] = [];
  imagePreviews = signal<string[]>([]);
  currentImage = signal(0);
  currentPage = 1;
  totalPages = 1;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.loadCategories();

    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      categoryId: ['', Validators.required],
      unitOfMeasurement: ['', Validators.required],
      technicalDescription: ['', Validators.required],
      unitPrice: [null, Validators.required],
      currency: ['', Validators.required],
      stockQuantity: [null, Validators.required]
    });
  }

  loadCategories(page: number = 1) {
    this.currentPage = page;
    this.categoryService.getAll(page, 10).subscribe(res => {
      this.categories.set(res.data.items);
      this.totalPages = res.data.totalPages;
    });
  }

  onSubmit() {
    if (this.productForm.invalid) return;
    const formData = new FormData();

    formData.append('productName', this.productForm.get('productName')?.value);
    formData.append('categoryId', this.productForm.get('categoryId')?.value); 
    formData.append('unitOfMeasurement', this.productForm.get('unitOfMeasurement')?.value);
    formData.append('technicalDescription', this.productForm.get('technicalDescription')?.value);
    formData.append('unitPrice', this.productForm.get('unitPrice')?.value);
    formData.append('currency', this.productForm.get('currency')?.value);
    formData.append('stockQuantity', this.productForm.get('stockQuantity')?.value);

    this.selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    this.productService.createProduct(formData).subscribe({
      next: () => this.router.navigate(['/vendor-admin/products']),
      error: (err) => {
        console.error('Backend Error:', err.error);
        alert('Error: Check console for missing/invalid fields.');
      }
    });
  }

  onFileSelected(event: any) {

    const files: FileList = event.target.files;

    if (!files.length) return;

    this.selectedFiles = [];
    this.imagePreviews.set([]);

    Array.from(files).forEach(file => {

      this.selectedFiles.push(file);

      const reader = new FileReader();

      reader.onload = () => {
        this.imagePreviews.update(images => [
          ...images,
          reader.result as string
        ]);
      };

      reader.readAsDataURL(file);

    });

    this.currentImage.set(0);

  }

  nextImage() {

    if (this.currentImage() === this.imagePreviews().length - 1)
      this.currentImage.set(0);
    else
      this.currentImage.update(v => v + 1);

  }

  prevImage() {

    if (this.currentImage() === 0)
      this.currentImage.set(this.imagePreviews().length - 1);
    else
      this.currentImage.update(v => v - 1);

  }
}
