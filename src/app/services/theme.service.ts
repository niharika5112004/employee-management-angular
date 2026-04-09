import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<string>('dark-theme');
  currentTheme = this.themeSubject.asObservable();

  toggleTheme() {
    const newTheme = this.themeSubject.value === 'dark-theme' ? 'light-theme' : 'dark-theme';
    this.themeSubject.next(newTheme);

    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(newTheme);

    localStorage.setItem('theme', newTheme);
  }

  initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    this.themeSubject.next(savedTheme);
    document.body.classList.add(savedTheme);
  }
}