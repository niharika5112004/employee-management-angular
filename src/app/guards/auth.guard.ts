import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('token_expiration');

    if (token && expiry && new Date().getTime() < Number(expiry)) {
      return true; // ✅ Token is valid
    } else {
      localStorage.clear(); // 🔥 Remove expired token
      this.router.navigate(['/login']); // ❌ Redirect to login
      return false;
    }
  }
}