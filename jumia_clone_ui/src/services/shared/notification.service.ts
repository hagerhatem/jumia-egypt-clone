// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';

declare var bootstrap: any;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toasts: any[] = [];

  constructor() { }

  private show(message: string, options: any = {}): void {
    // Setup default options
    const defaultOptions = {
      autohide: true,
      delay: 5000
    };

    const toastOptions = { ...defaultOptions, ...options };
    
    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.className = `toast ${options.className || ''}`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    // Toast header
    if (options.title) {
      const header = document.createElement('div');
      header.className = 'toast-header';
      
      if (options.icon) {
        const icon = document.createElement('i');
        icon.className = `bi ${options.icon} me-2`;
        header.appendChild(icon);
      }
      
      const title = document.createElement('strong');
      title.className = 'me-auto';
      title.textContent = options.title;
      
      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'btn-close';
      closeButton.setAttribute('data-bs-dismiss', 'toast');
      closeButton.setAttribute('aria-label', 'Close');
      
      header.appendChild(title);
      header.appendChild(closeButton);
      toastEl.appendChild(header);
    }
    
    // Toast body
    const body = document.createElement('div');
    body.className = 'toast-body';
    body.textContent = message;
    toastEl.appendChild(body);
    
    // Add to container or create one
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(container);
    }
    
    container.appendChild(toastEl);
    
    // Create Bootstrap toast instance
    const toast = new bootstrap.Toast(toastEl, toastOptions);
    
    // Show the toast
    toast.show();
    
    // Remove toast element after it's hidden
    toastEl.addEventListener('hidden.bs.toast', () => {
      container?.removeChild(toastEl);
      this.toasts = this.toasts.filter(t => t !== toast);
    });
    
    this.toasts.push(toast);
  }

  showSuccess(message: string, title = 'Success'): void {
    this.show(message, {
      className: 'bg-success text-white',
      title,
      icon: 'bi-check-circle-fill'
    });
  }

  showError(message: string, title = 'Error'): void {
    this.show(message, {
      className: 'bg-danger text-white',
      title,
      icon: 'bi-exclamation-circle-fill'
    });
  }

  showWarning(message: string, title = 'Warning'): void {
    this.show(message, {
      className: 'bg-warning',
      title,
      icon: 'bi-exclamation-triangle-fill'
    });
  }

  showInfo(message: string, title = 'Info'): void {
    this.show(message, {
      className: 'bg-info text-white',
      title,
      icon: 'bi-info-circle-fill'
    });
  }
}