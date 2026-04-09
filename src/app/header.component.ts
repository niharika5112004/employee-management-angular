import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isDark = true;

  ngOnInit() {
    const saved = localStorage.getItem('theme') || 'dark';

    this.isDark = saved === 'dark';

    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(this.isDark ? 'dark-theme' : 'light-theme');
  }

  toggleTheme() {
    this.isDark = !this.isDark;

    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(this.isDark ? 'dark-theme' : 'light-theme');

    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
  }
}