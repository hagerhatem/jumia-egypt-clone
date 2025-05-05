import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dynamic-attribute-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-3" [formGroup]="formGroup">
      <label [for]="attributeName" class="form-label">
        {{attributeName}}
        <span class="text-danger" *ngIf="isRequired">*</span>
      </label>

      <div [ngSwitch]="attributeType">
        <!-- Text input -->
        <input *ngSwitchCase="'text'" 
               type="text" 
               class="form-control" 
               [id]="attributeName"
               formControlName="value"
               [ngClass]="{'is-invalid': isInvalid}"
               [placeholder]="'Enter ' + attributeName">

        <!-- Number input -->
        <input *ngSwitchCase="'number'" 
               type="number" 
               class="form-control" 
               [id]="attributeName"
               formControlName="value"
               [ngClass]="{'is-invalid': isInvalid}"
               [placeholder]="'Enter ' + attributeName">

        <!-- Select input -->
        <select *ngSwitchCase="'select'" 
                class="form-select"
                [id]="attributeName"
                formControlName="value"
                [ngClass]="{'is-invalid': isInvalid}">
          <option value="">Select {{attributeName}}</option>
          <option *ngFor="let option of options" [value]="option">{{option}}</option>
        </select>

        <!-- Boolean input -->
        <div *ngSwitchCase="'boolean'" class="form-check">
          <input type="checkbox" 
                 class="form-check-input" 
                 [id]="attributeName"
                 formControlName="value"
                 [ngClass]="{'is-invalid': isInvalid}">
          <label class="form-check-label" [for]="attributeName">{{attributeName}}</label>
        </div>

        <!-- Default case -->
        <input *ngSwitchDefault
               type="text" 
               class="form-control" 
               [id]="attributeName"
               formControlName="value"
               [ngClass]="{'is-invalid': isInvalid}"
               [placeholder]="'Enter ' + attributeName">
      </div>

      <!-- Validation error message -->
      <div class="invalid-feedback" *ngIf="isInvalid">
        {{errorMessage}}
      </div>
    </div>
  `
})
export class DynamicAttributeInputComponent {
  @Input() formGroup!: FormGroup;
  @Input() attributeName: string = '';
  @Input() attributeType: string = 'text';
  @Input() options: string[] = [];
  @Input() isRequired: boolean = true;

  get isInvalid(): boolean {
    const control = this.formGroup.get('value');
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  get errorMessage(): string {
    const control = this.formGroup.get('value');
    if (!control) return '';

    if (control.errors?.['required']) {
      return `${this.attributeName} is required`;
    }
    
    if (control.errors?.['min']) {
      return `${this.attributeName} must be at least ${control.errors['min'].min}`;
    }
    
    if (control.errors?.['max']) {
      return `${this.attributeName} cannot exceed ${control.errors['max'].max}`;
    }

    return 'Invalid value';
  }
}