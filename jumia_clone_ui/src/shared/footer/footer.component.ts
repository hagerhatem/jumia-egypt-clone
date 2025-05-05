// shared/footer/footer.component.ts
import { Component , OnInit } from '@angular/core';
import { RouterModule , Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }

 
  subscribeToNewsletter(email: string): void {
  
    console.log('Email subscribed:', email);
  }

  acceptTerms(event: any): void {
  
    console.log('Terms accepted:', event.target.checked);
  }
}