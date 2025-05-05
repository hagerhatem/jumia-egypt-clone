import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = environment.apiUrl;
  constructor(private httpClient: HttpClient) { }
  
  AskQuestion(question: string): Observable<any> {
    // Send the question string directly without wrapping it in an object
    return this.httpClient.post<any>(`${this.apiUrl}/api/AIQuery/ask`, JSON.stringify(question), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  searchByImage(image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    
    return this.httpClient.post<any>(`${this.apiUrl}/api/AIQuery/search-by-image`, formData);
  }

}
