import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-add-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-add-user.component.html',
  styleUrls: ['./admin-add-user.component.css']
})
export class AdminAddUserComponent {

  email: string = '';
  password: string = '';
  role: string = 'user';

  constructor(private userService: UserService, private router: Router) {}

  addUser() {

    if (localStorage.getItem('role') !== 'admin') {
      alert('Access denied! Only admin can create users.');
      return;
    }

    this.userService.createUser({
      email: this.email,
      password: this.password,
      role: this.role
    }).subscribe({
      next: () => {
        alert('User created successfully!');
        this.email = '';
        this.password = '';
        this.role = 'user';
        this.router.navigate(['/employees']);
      },
      error: (err: any) =>
        alert('Error: ' + (err.error?.message || err.message))
    });
  }
}