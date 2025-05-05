import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, catchError } from 'rxjs';
import { environment } from '../../../src/environments/environment'; // Adjust the import path as necessary

@Injectable({
  providedIn: 'root'
})
export class AddressService { // replace with your API URL
  private apiUrl = environment.apiUrl;
  private countriesApiUrl = 'https://restcountries.com/v3.1';
  private cityStateApiUrl = 'https://countriesnow.space/api/v0.1';
  constructor(private http: HttpClient) { }
  getCountries(): Observable<any[]> {
    return this.http.get<any[]>(`${this.countriesApiUrl}/all`).pipe(
      map((countries) => {
        return countries.map(country => ({
          id: country.cca2,
          name: country.name.common,
          code: country.cca2
        })).sort((a, b) => a.name.localeCompare(b.name));
      })
    );
  }


  getStates(countryCode: string): Observable<any> {
    // Create a mapping for country codes to full names
    const countryMapping: { [key: string]: string } = {
      'US': 'United States',
      'GB': 'United Kingdom',
      'EG': 'Egypt',
      // Add more mappings as needed
    };

    const countryName = countryMapping[countryCode] || countryCode;
    
    const body = {
      country: countryName
    };

    return this.http.post(`${this.cityStateApiUrl}/countries/states`, body).pipe(
      map((response: any) => {
        if (response.data && response.data.states) {
          return response.data.states.map((state: any) => ({
            id: state.state_code || state.name,
            name: state.name,
            countryCode: countryCode
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching states:', error);
        throw error;
      })
    );
  }

  getCities(countryCode: string, stateName: string): Observable<any> {
    const countryMapping: { [key: string]: string } = {
      'US': 'United States',
      'GB': 'United Kingdom',
      'EG': 'Egypt',
      // Add more mappings as needed
    };

    const countryName = countryMapping[countryCode] || countryCode;
    
    const body = {
      country: countryName,
      state: stateName
    };

    return this.http.post(`${this.cityStateApiUrl}/countries/state/cities`, body).pipe(
      map((response: any) => {
        if (response.data) {
          return response.data.map((city: string) => ({
            id: city,
            name: city,
            stateCode: stateName
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching cities:', error);
        throw error;
      })
    );
  }
  getAddresses(userId: number, page: number = 1, pageSize: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('userId', userId.toString())
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get(`${this.apiUrl}/api/Addresses`, { params });
  }

  getAddressById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/Addresses/${id}`);
  }

  createAddress(addressData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/Addresses`, addressData);
  }

  updateAddress(id: number, addressData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/Addresses/${id}`, addressData);
  }

  deleteAddress(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/Addresses/${id}`);
  }
}