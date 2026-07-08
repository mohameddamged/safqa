import { Component, OnInit, signal } from '@angular/core';
import { CategoryService } from '../../../core/services/category-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-categories',
  imports: [ReactiveFormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  categories = signal<any[]>([]);
  isModalOpen = false;
  categoryForm: FormGroup;
  editingCategory: any = null;
  isConfirmOpen = false;
  categoryToDelete: any = null;
  currentPage = 1;
  totalPages = 1;

  constructor(private categoryService: CategoryService, private fb: FormBuilder) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories(page: number = 1) {
    this.currentPage = page;
    this.categoryService.getAll(page, 10).subscribe(res => {
      this.categories.set(res.data.items);
      this.totalPages = res.data.totalPages;
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.loadCategories(page);
    }
  }

  openAddModal() {
    this.editingCategory = null;
    this.categoryForm.reset();
    this.isModalOpen = true;
  }

  openEditModal(cat: any) {
    this.editingCategory = cat;
    this.categoryForm.patchValue({ name: cat.name, description: cat.description });
    this.isModalOpen = true;
  }

  saveCategory() {
    if (this.categoryForm.invalid) return;

    const { name, description } = this.categoryForm.value;

    if (this.editingCategory) {
      this.categoryService.update(this.editingCategory.id, name, description).subscribe(() => this.afterSave());
    } else {
      this.categoryService.create(name, description).subscribe(() => this.afterSave());
    }
  }

  afterSave() {
    this.loadCategories();
    this.isModalOpen = false;
  }

  confirmDelete(cat: any) {
    this.categoryToDelete = cat;
    this.isConfirmOpen = true;
  }

  executeDelete() {
    if (this.categoryToDelete) {
      this.categoryService.delete(this.categoryToDelete.id).subscribe(() => {
        this.loadCategories();
        this.isConfirmOpen = false;
        this.categoryToDelete = null;
      });
    }
  }
}