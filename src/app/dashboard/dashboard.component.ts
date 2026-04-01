import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { AnalyticsComponent } from '../analytics/analytics.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AnalyticsComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  totalEmployees: number = 0;
  loginsToday: number = 0;
  recentActivities: any[] = [];
  role: string = '';

 
  showDashboard: boolean = false;
  showAnalytics: boolean = false;

  constructor(
    private empService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.role = localStorage.getItem('role') || 'User';

    //  Refresh subscription 
    this.empService.refresh$.subscribe(() => {
      if (this.showDashboard) {
        this.loadDashboard();
      }
    });
  }

  //  DASHBOARD FUNCTIONS 
  loadDashboard() {
    console.log('Calling Dashboard APIs...');

    this.empService.getEmployeeCount().subscribe({
      next: (res) => { this.totalEmployees = res.count || 0; },
      error: (err) => { console.error('Employee Count Error:', err); }
    });

    this.empService.getLoginCount().subscribe({
      next: (res) => { this.loginsToday = res.count || 0; },
      error: (err) => { console.error('Login Count Error:', err); }
    });

    this.empService.getRecentActivity().subscribe({
      next: (data) => { this.recentActivities = data.slice(0, 5); },
      error: (err) => { console.error('Activity Error:', err); }
    });
  }
//NAVIGATION 
  goToDashboard() {
    this.showDashboard = true;
    this.showAnalytics = false;
    this.loadDashboard(); //  load only when clicked
  }

  goToAnalytics() {
    this.showDashboard = false;
    this.showAnalytics = true;
  }

  goToEmployees() {
    this.router.navigate(['/employees']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}