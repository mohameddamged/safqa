import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface CtaCircle {
  label: string;
  icon: string;
}

// منتجات فعلية شركات بتتاجر فيها على المنصة (Procurement B2B):
// أجهزة لابتوب، موبايلات، شاشات، طابعات، أثاث مكتبي، شحن وتغليف... إلخ.
const CIRCLES: CtaCircle[] = [
  { label: 'Laptops', icon: 'assets/products/laptop.svg' },
  { label: 'Mobile Phones', icon: 'assets/products/mobile.svg' },
  { label: 'Monitors & Displays', icon: 'assets/products/monitor.svg' },
  { label: 'Printers', icon: 'assets/products/printer.svg' },
  { label: 'Office Furniture', icon: 'assets/products/chair.svg' },
  { label: 'Shipping & Packaging', icon: 'assets/products/boxes.svg' },
  { label: 'Cameras & Equipment', icon: 'assets/products/camera.svg' },
  { label: 'Audio Devices', icon: 'assets/products/headphones.svg' },
  { label: 'Tablets', icon: 'assets/products/tablet.svg' },
];

@Component({
  selector: 'app-procurement',
  imports: [RouterLink],
  templateUrl: './procurement.html',
  styleUrl: './procurement.css',
})
export class Procurement {
  circles = CIRCLES;
}
