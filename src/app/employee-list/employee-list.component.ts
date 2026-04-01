import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmployeeModalComponent } from '../employee-modal/employee-modal.component';
import { EmployeeService } from '../services/employee.service';

// Angular Material
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EmployeeModalComponent,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit, AfterViewInit {

  employees: any[] = [];
  searchText: string = '';

  dataSource = new MatTableDataSource<any>();

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

  showModal = false;
  selectedEmployee: any = null;

  isAdmin = localStorage.getItem('role') === 'admin';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    const cached = localStorage.getItem('employees');

    if (cached) {
      this.employees = JSON.parse(cached);
      this.dataSource.data = this.employees;
    }

    // ✅ FIX: custom filter for all fields
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const value = (
        (data.id || '') +
        (data.first_name || '') +
        (data.last_name || '') +
        (data.email || '') +
        (data.phone || '') +
        (data.department || '') +
        (data.salary || '')
      ).toLowerCase();

      return value.includes(filter);
    };

    this.loadEmployees();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data: any[]) => {
        this.employees = data;
        this.refreshTable();

        localStorage.setItem('employees', JSON.stringify(data));
      },
      error: (err) => console.error('Failed to load employees:', err)
    });
  }

  // ✅ FIX: better filter
  applyFilter(): void {
    const filterValue = this.searchText.trim().toLowerCase();
    this.dataSource.filter = filterValue;

    // reset paginator after filter
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddModal(): void {
    this.selectedEmployee = null;
    this.showModal = true;
  }

  editEmployee(emp: any): void {
    this.selectedEmployee = emp;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  handleSave(formValue: any) {
    if (this.selectedEmployee) {

      const idx = this.employees.findIndex(emp => emp.id === this.selectedEmployee.id);
      if (idx !== -1) {
        this.employees[idx] = { ...this.selectedEmployee, ...formValue };
      }

      this.refreshTable();
      this.closeModal();

      this.employeeService.updateEmployee(this.selectedEmployee.id, formValue).subscribe({
        next: () => localStorage.setItem('employees', JSON.stringify(this.employees)),
        error: (err) => console.error('Update failed:', err)
      });

    } else {

      const tempId = Math.max(...this.employees.map(e => e.id), 0) + 1;
      const newEmp = { id: tempId, ...formValue };

      this.employees.push(newEmp);
      this.refreshTable();
      this.closeModal();

      this.employeeService.addEmployee(formValue).subscribe({
        next: (addedEmp: any) => {
          const idx = this.employees.findIndex(e => e.id === tempId);
          if (idx !== -1) this.employees[idx] = addedEmp;

          this.refreshTable();
          localStorage.setItem('employees', JSON.stringify(this.employees));
        },
        error: (err) => console.error('Add failed:', err)
      });
    }
  }

  confirmDelete(id: number): void {
    if (confirm('Are you sure you want to delete?')) {

      this.employees = this.employees.filter(emp => emp.id !== id);
      this.refreshTable();

      localStorage.setItem('employees', JSON.stringify(this.employees));

      this.employeeService.deleteEmployee(id).subscribe({
        error: (err) => console.error('Delete failed:', err)
      });
    }
  }

  // ✅ FIX: reattach paginator + sort after refresh
  refreshTable() {
    this.dataSource.data = [...this.employees];

    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }

    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }
}