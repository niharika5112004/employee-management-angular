import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-employee-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-modal.component.html',
  styleUrls: ['./employee-modal.component.css']
})
export class EmployeeModalComponent implements OnInit {

  @Input() employeeData: any = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<any>();

  profileForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],

      // 📧 Email → required + valid format
      email: ['', [Validators.required, Validators.email]],

      // 📱 Phone → required + exactly 10 digits
      phone: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/)
      ]],

      department: ['', Validators.required],
      designation: ['', Validators.required],

      // 💰 Salary → required + must be >= 100
      salary: ['', [
        Validators.required,
        Validators.min(100)
      ]]
    });
  }

  ngOnInit(): void {
    if (this.employeeData) {
      this.profileForm.patchValue(this.employeeData);
    }
  }

  submitForm() {
    this.submitted = true;

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched(); // 🔥 show all errors on submit
      return;
    }

    this.onSave.emit(this.profileForm.value);
    this.closeModal();
  }

  closeModal() {
    this.onClose.emit();
  }

  // 🔥 OPTIONAL: helper for duplicate email (use when backend says duplicate)
  setDuplicateEmailError() {
    this.profileForm.get('email')?.setErrors({ duplicate: true });
  }
}