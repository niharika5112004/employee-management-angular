import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { AdminAddUserComponent } from './admin-add-user/admin-add-user.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [

  // Default route
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Login
  { path: 'login', component: LoginComponent },

  // Dashboard (any logged-in user)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },

  // Employees (ADMIN ONLY)
  {
    path: 'employees',
    component: EmployeeListComponent,
    canActivate: [AuthGuard]
  },

  // Admin - Add User (ADMIN ONLY)
  {
    path: 'admin/add-user',
    component: AdminAddUserComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },

  // Wildcard (optional - redirect unknown routes)
  { path: '**', redirectTo: 'login' }

];