import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { EmployeeService } from '../services/employee.service';
import { EmployeeModalComponent } from '../employee-modal/employee-modal.component';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    EmployeeModalComponent
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {

  displayedColumns: string[] = [
    'id',
    'first_name',
    'last_name',
    'email',
    'phone',
    'department',
    'salary',
    'actions'
  ];

  dataSource = new MatTableDataSource<any>();
  searchText: string = '';

  showModal = false;
  selectedEmployee: any = null;

  isAdmin = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();

    const role = localStorage.getItem('role');
    this.isAdmin = role === 'admin';
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe((data: any[]) => {
      this.dataSource.data = data;

      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    });
  }

  applyFilter() {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

  openAddModal() {
    this.selectedEmployee = null;
    this.showModal = true;
  }

  editEmployee(emp: any) {
    this.selectedEmployee = emp;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  handleSave(employee: any) {
    if (employee.id) {
      
      
      this.employeeService.updateEmployee(employee.id, employee).subscribe(() => {
        this.loadEmployees();
      });
    } else {
      this.employeeService.addEmployee(employee).subscribe(() => {
        this.loadEmployees();
      });
    }
    this.closeModal();
  }

  confirmDelete(id: number) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe(() => {
        this.loadEmployees();
      });
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}