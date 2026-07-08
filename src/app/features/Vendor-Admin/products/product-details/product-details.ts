import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../../core/services/Vendor-Admin/product-service';
import { CategoryService } from '../../../../core/services/System-Admin/category-service/category-service';

@Component({
  selector: 'app-product-details',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {
  productForm!: FormGroup;
  productImages = signal<string[]>([]);
  categories = signal<any[]>([]);
  selectedMainImage = signal<string>('');
  isEditMode = signal(false);
  productId!: number;
  currentPage = 1;
  totalPages = 1;
  currentImage = signal(0);
  newImages: File[] = [];
  newImagePreviews = signal<string[]>([]);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.productId = this.route.snapshot.params['id'];
    this.loadProductDetails()
  }

  initForm() {
    this.productForm = this.fb.group({
      productName: [{ value: '', disabled: true }],
      technicalDescription: [{ value: '', disabled: true }],
      categoryId: [{ value: '', disabled: true }],
      unitOfMeasurement: [{ value: '', disabled: true }],
      unitPrice: [{ value: '', disabled: true }],
      currency: [{ value: '', disabled: true }],
      stockQuantity: [{ value: '', disabled: true }]
    });
  }

  cancelEdit() {

    this.newImages = [];
    this.newImagePreviews.set([]);

    this.isEditMode.set(false);

    this.productForm.disable();

    this.loadProductDetails();

  }

  toggleEdit() {
    if (this.isEditMode()) {
      this.saveProduct();
    } else {
      this.isEditMode.set(true);
      this.productForm.enable();
    }
  }

  saveProduct() {

    if (this.productForm.invalid) return;

    const updatedData = this.productForm.getRawValue();

    this.productService.updateProduct(this.productId, updatedData)
      .subscribe({

        next: () => {

          if (this.newImages.length) {

            this.uploadImages();

          } else {

            this.isEditMode.set(false);
            this.productForm.disable();
            this.loadProductDetails();

          }

        },

        error: err => {

          console.error(err);
          alert('Failed to update product.');

        }

      });

  }

  loadProductDetails() {
    this.productService.getProductById(this.productId).subscribe(res => {
      const data = res.data;
      this.productForm.patchValue(data);

      if (data.imageUrls && data.imageUrls.length > 0) {
        this.productImages.set(data.imageUrls);
        this.currentImage.set(0);
      }
    });
  }
  loadCategories(page: number = 1) {
    this.currentPage = page;
    this.categoryService.getAll(page, 10).subscribe(res => {
      this.categories.set(res.data.items);
      this.totalPages = res.data.totalPages;
    });
  }

  onImagesSelected(event: any) {

    const files: File[] = Array.from(event.target.files);

    if (!files.length) return;

    files.forEach(file => {

      this.newImages.push(file);

      const reader = new FileReader();

      reader.onload = () => {

        this.newImagePreviews.update(images => [
          ...images,
          reader.result as string
        ]);

      };

      reader.readAsDataURL(file);

    });

    event.target.value = '';

  }

  uploadImages() {

    if (!this.newImages.length) {
      return;
    }

    const formData = new FormData();

    this.newImages.forEach(file => {
      formData.append('images', file);
    });

    this.productService.addProductImages(this.productId, formData)
      .subscribe({

        next: () => {

          this.newImages = [];
          this.newImagePreviews.set([]);

          this.loadProductDetails();

          this.isEditMode.set(false);
          this.productForm.disable();

        },

        error: err => {

          console.error(err);

        }

      });

  }


  nextImage() {

    if (this.currentImage() === this.productImages().length - 1)
      this.currentImage.set(0);
    else
      this.currentImage.update(v => v + 1);

  }

  prevImage() {

    if (this.currentImage() === 0)
      this.currentImage.set(this.productImages().length - 1);
    else
      this.currentImage.update(v => v - 1);

  }
}
