import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../../services/auth/auth.service';

@Component({
  selector: 'app-account-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-overview.component.html',
  styleUrls: ['./account-overview.component.css'],
})
export class AccountOverviewComponent implements OnInit {
  user: any;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.currentUserValue;
  }
}
