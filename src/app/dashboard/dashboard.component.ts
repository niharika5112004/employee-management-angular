import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { AnalyticsComponent } from '../analytics/analytics.component';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, AnalyticsComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  role: string = '';
  isAdmin: boolean = false; // ✅ ADDED

  totalEmployees: number = 0;
  loginsToday: number = 0;
  recentActivities: any[] = [];
  loadingActivities: boolean = true;

  showDashboard = true;
  showAnalytics = false;
  showWelcome = true;

  private refreshSub: Subscription | undefined;

  constructor(
    private empService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.role = localStorage.getItem('role') || '';

    this.isAdmin = this.role === 'admin'; // ✅ ADDED

    this.loadData();

    this.refreshSub = interval(5000).subscribe(() => {
      this.loadData();
    });
  }

  ngOnDestroy() {
    if (this.refreshSub) this.refreshSub.unsubscribe();
  }

  loadData() {
    this.empService.getEmployeeCount().subscribe(res => {
      this.totalEmployees = res.count;
    });

    this.empService.getLoginsToday().subscribe(res => {
      this.loginsToday = res.count;
    });

    this.empService.getRecentActivity().subscribe(res => {
      this.recentActivities = res || [];
      this.loadingActivities = false;
    }, err => {
      console.error('Failed to load recent activity:', err);
      this.recentActivities = [];
      this.loadingActivities = false;
    });
  }

  goToDashboard() {
    this.showDashboard = true;
    this.showAnalytics = false;
    this.showWelcome = false;
  }

  goToAnalytics() {
    this.showDashboard = false;
    this.showAnalytics = true;
    this.showWelcome = false;
  }

  goToEmployees() {
    this.router.navigate(['/employees']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // ✅ ADDED (for navigation)
  goToAddUser() {
    this.router.navigate(['/admin/add-user']);
  }
}