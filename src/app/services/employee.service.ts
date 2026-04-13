import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private API = 'https://angular-backend-1-s3vg.onrender.com';

  private refreshNeeded = new Subject<void>();
  refresh$ = this.refreshNeeded.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  login(data: any) {
    return this.http.post(`${this.API}/login`, data);
  }

  getEmployeeCount() {
    return this.http.get<any>(`${this.API}/employees/count`, this.getHeaders());
  }

  getLoginsToday() {
    return this.http.get<any>(`${this.API}/employees/logins-today`, this.getHeaders());
  }

  getRecentActivity() {
    return this.http.get<any[]>(`${this.API}/employees/recent-activity`, this.getHeaders());
  }

  getDesignationStats() {
    return this.http.get<any[]>(`${this.API}/employees/designation-stats`, this.getHeaders());
  }

  getDepartmentSalaryStats() {
    return this.http.get<any[]>(`${this.API}/employees/department-salaries`, this.getHeaders());
  }

  getEmployeeGrowth() {
    return this.http.get<any[]>(`${this.API}/employees/growth`, this.getHeaders());
  }

  getEmployees() {
    return this.http.get<any[]>(`${this.API}/employees`, this.getHeaders());
  }

  addEmployee(data: any) {
    return this.http.post(`${this.API}/employees`, data, this.getHeaders());
  }

  updateEmployee(id: number, data: any) {
    return this.http.put(`${this.API}/employees/${id}`, data, this.getHeaders());
  }

  deleteEmployee(id: number) {
    return this.http.delete(`${this.API}/employees/${id}`, this.getHeaders());
  }

  triggerRefresh() {
    this.refreshNeeded.next();
  }
}