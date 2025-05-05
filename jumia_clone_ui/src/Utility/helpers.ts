import { environment } from "../environments/environment";

export class Helpers{
      public getFullImageUrl(imagePath: string | undefined): string {
        if(!imagePath) return 'assets/images/placeholder.jpg';
        return `${environment.apiUrl}/${imagePath}`;
      }

      public static getFullImageUrl2(imagePath: string): string {
        return `${environment.apiUrl}/${imagePath}`;
      }
}