import { Component, OnInit, signal } from '@angular/core';
import { ProductService } from '../../../../core/services/Vendor-Admin/product-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  products = signal<any[]>([]);
  isLoading = signal(true);
  
  currentPage = signal(1); 
  totalPages = signal(1);  

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts(this.currentPage());
  }

  loadProducts(page: number) {
    this.isLoading.set(true);
    this.productService.getProducts(page, 10).subscribe({
      next: (res) => {
        this.products.set(res.data.items);
        this.totalPages.set(res.data.totalPages); 
        this.currentPage.set(page);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.loadProducts(page);
    }
  }
}
