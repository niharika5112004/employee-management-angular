import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Dummy users (later connect backend)
  private users = [
    { email: 'admin@gmail.com', password: '1234', role: 'admin' },
    { email: 'user@gmail.com', password: '1234', role: 'user' }
  ];

  login(email: string, password: string, role: string): boolean {
    const user = this.users.find(
      u => u.email === email && u.password === password && u.role === role
    );

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('user');
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }
}