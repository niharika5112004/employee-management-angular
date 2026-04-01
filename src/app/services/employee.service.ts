import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private baseUrl = 'http://localhost:3000';

  private refreshSource = new Subject<void>();
  refresh$ = this.refreshSource.asObservable();

  constructor(private http: HttpClient) {}

  // 🔄 Refresh trigger
  triggerRefresh(): void {
    this.refreshSource.next();
  }

  // ---------------- EMPLOYEE APIs ----------------
  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/employees`);
  }

  getEmployeeCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/employees/count`);
  }

  getLoginCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/logins/count`);
  }

  getRecentActivity(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/recent-activity`);
  }
  getEmployeeGrowth() {
    return this.http.get<any[]>(`${this.baseUrl}/employees/growth`);
  }

  addEmployee(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/employees`, data);
  }

  updateEmployee(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/employees/${id}`, data);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/employees/${id}`);
  }

  // ---------------- ANALYTICS APIs ----------------

  // ✅ Pie Chart: designation count
  getDesignationStats(): Observable<{ designation: string; count: number }[]> {
    return this.http.get<{ designation: string; count: number }[]>(
      `${this.baseUrl}/employees/designation-stats`
    );
  }

  // ✅ Bar Chart: avg salary per department
  getDepartmentSalaryStats(): Observable<{ department: string; avgSalary: number }[]> {
    return this.http.get<{ department: string; avgSalary: number }[]>(
      `${this.baseUrl}/employees/department-salaries`
    );
  }
}