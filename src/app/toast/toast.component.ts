
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {
    this.toastService.toastState$.subscribe((toast: Toast) => {
      this.toasts.push(toast);

      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t !== toast);
      }, 3000);
    });
  }
}