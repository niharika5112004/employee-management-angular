import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  role: string = 'user';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private empService: EmployeeService
  ) {}

  onLogin() {

    // ================= ADMIN LOGIN =================
    if (
      this.email === 'admin@gmail.com' &&
      this.password === 'admin123' &&
      this.role === 'admin'
    ) {
      localStorage.setItem('role', 'admin');
      alert('Admin Login Success ✅');

      this.logLoginToBackend();

      this.empService.triggerRefresh();

      // ✅ ONLY CHANGE HERE
      this.router.navigate(['/dashboard']);
    }

    // ================= USER LOGIN =================
    else if (
      this.email === 'user@gmail.com' &&
      this.password === 'user123' &&
      this.role === 'user'
    ) {
      localStorage.setItem('role', 'user');
      alert('User Login Success ✅');

      this.logLoginToBackend();

      this.empService.triggerRefresh();

      // ✅ ONLY CHANGE HERE
      this.router.navigate(['/dashboard']);
    }

    // ================= INVALID =================
    else {
      this.errorMessage = 'Invalid credentials!';
    }
  }

  // 🔥 Log login into backend
  private logLoginToBackend() {
    const loginData = {
      email: this.email,
      role: this.role
    };

    this.http.post('http://localhost:3000/login', loginData)
      .subscribe({
        next: () => console.log('Login logged in DB ✅'),
        error: (err) => console.error('Login logging failed:', err)
      });
  }
}