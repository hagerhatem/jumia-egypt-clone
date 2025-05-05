// vouchers.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-vouchers',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbNavModule],
  templateUrl: './customer-vouchers.component.html',
  styleUrls: ['./customer-vouchers.component.css'],
})
export class VouchersComponent {
  activeTab: 'ACTIVE' | 'INACTIVE' = 'ACTIVE';

  constructor(private router: Router) {}

  setActiveTab(tab: 'ACTIVE' | 'INACTIVE'): void {
    this.activeTab = tab;
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
