import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/register'; // ✅ FIXED

  constructor(private http: HttpClient) {}

  createUser(userData: { email: string; password: string; role: string }): Observable<any> {

    const token = localStorage.getItem('token');

    return this.http.post(this.apiUrl, userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}