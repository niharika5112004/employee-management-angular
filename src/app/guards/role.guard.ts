import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {

    const expectedRole = route.data['role'];
    const userRole = localStorage.getItem('role');

    if (userRole === expectedRole) {
      return true;
    } else {
      alert('Access Denied! Admins only.');
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}