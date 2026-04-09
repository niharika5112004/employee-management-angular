import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { ToastComponent } from './toast/toast.component';
import { HeaderComponent } from './header.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, HeaderComponent],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-toast></app-toast>
  `,
})
export class App {
  constructor(private themeService: ThemeService, private router: Router) {
    this.themeService.initTheme();

    this.checkTokenExpiration();
  }

  private checkTokenExpiration() {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('token_expiration');

    if (!token || !expiration) {
      // No token → redirect to login
      this.router.navigate(['/login']);
      return;
    }

    const now = new Date().getTime();
    const expTime = parseInt(expiration, 10);

    if (now > expTime) {
      // Token expired → clear storage and redirect
      localStorage.clear();
      alert('Session expired. Please login again.');
      this.router.navigate(['/login']);
    }
  }
}