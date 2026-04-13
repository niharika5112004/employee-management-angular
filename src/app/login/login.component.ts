import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private empService: EmployeeService
  ) {}

  ngOnInit() {
    if (!localStorage.getItem('token')) {
      localStorage.clear();
    }
  }

  onLogin() {

   
    this.empService.login({
      email: this.email,
      password: this.password
    }).subscribe({

      next: (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);

        const expiration = new Date().getTime() + 60 * 60 * 1000;
        localStorage.setItem('token_expiration', expiration.toString());

        alert('Login Successful ✅');

        this.empService.triggerRefresh();
        this.router.navigate(['/dashboard']);
      },

      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed';
      }
    });
  }
}