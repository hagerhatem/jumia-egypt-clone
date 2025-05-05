// navigation.service.ts 
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  
private categoryName: string = '';
private categoryId: string = '';
private subcategoryId: string = '';

setCategoryName(name: string): void {
  this.categoryName = name;
}

getCategoryName(): string {
  return this.categoryName;
}

setCategoryId(id: string): void {
  this.categoryId = id;
}

getCategoryId(): string {
  return this.categoryId;
}

setSubcategoryId(id: string): void {
  this.subcategoryId = id;
}

getSubcategoryId(): string {
  return this.subcategoryId;
}

// Optional: Clear methods to reset stored values when needed
clearCategoryData(): void {
  this.categoryName = '';
  this.categoryId = '';
  this.subcategoryId = '';
}
}