import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

// src/app/shared/components/notification/notification.component.ts
@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="message" [ngClass]="['notification', type]">
      {{ message }}
      <button class="close-btn" (click)="close()">&times;</button>
    </div>
  `,
  styles: [`
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px;
      border-radius: 4px;
      z-index: 1000;
      max-width: 300px;
    }
    .success {
      background-color: #d4edda;
      color: #155724;
    }
    .error {
      background-color: #f8d7da;
      color: #721c24;
    }
    .close-btn {
      background: none;
      border: none;
      float: right;
      cursor: pointer;
    }
  .warning {
    background-color: #fff3cd;
    color: #856404;
  }
  .info {
    background-color: #d1ecf1;
    color: #0c5460;
  }
  /* Add animation */
  .notification {
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  `]
})
export class NotificationComponent {
  @Input() message: string | null = null;
  @Input() type: 'success' | 'error'|'warning' | 'info'  = 'success';
  @Output() closed = new EventEmitter<void>();
 
  
  close() {
    this.message = null;
    this.closed.emit();
  }
}