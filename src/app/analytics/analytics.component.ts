import { Component, OnInit, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { EmployeeService } from '../services/employee.service';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit, AfterViewInit {

  @ViewChild('pieChart') pieChart!: BaseChartDirective;
  @ViewChild('barChart') barChart!: BaseChartDirective;
  @ViewChild('lineChart') lineChart!: BaseChartDirective;

  designationData: any = { labels: [], datasets: [] };
  salaryData: any = { labels: [], datasets: [] };
  growthData: any = { labels: [], datasets: [] };

  designationOptions: any;
  salaryOptions: any;
  growthOptions: any;

  constructor(
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setOptions();
  }

  ngAfterViewInit(): void {
    this.loadCharts();
  }

  private setOptions(): void {
    const interaction = {
      mode: 'nearest' as const,
      intersect: false
    };

    const tooltipBase = {
      enabled: true,
      backgroundColor: '#111',
      titleColor: '#00F5D4',
      bodyColor: '#fff',
      borderColor: '#00F5D4',
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      titleFont: { size: 14, weight: '600' },
      bodyFont: { size: 13 }
    };

    this.designationOptions = {
      responsive: true,
      maintainAspectRatio: true,
      interaction,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#ccc', padding: 20, usePointStyle: true } },
        tooltip: {
          ...tooltipBase,
          callbacks: {
            label: (context: any) => {
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percent = total > 0 ? ((context.raw / total) * 100).toFixed(1) : '0';
              return `${context.label}: ${context.raw} employees (${percent}%)`;
            }
          }
        }
      }
    };

    this.salaryOptions = {
      responsive: true,
      maintainAspectRatio: true,
      interaction,
      plugins: {
        legend: { labels: { color: '#ccc' } },
        tooltip: {
          ...tooltipBase,
          callbacks: {
            label: (context: any) => `Avg Salary: ₹${Number(context.raw).toLocaleString('en-IN')}`
          }
        }
      }
    };

    this.growthOptions = {
      responsive: true,
      maintainAspectRatio: true,
      interaction,
      plugins: {
        legend: { labels: { color: '#ccc' } },
        tooltip: {
          ...tooltipBase,
          callbacks: {
            label: (context: any) => `Employees Joined: ${context.raw}`
          }
        }
      }
    };
  }

  loadCharts(): void {
    // PIE
    this.employeeService.getDesignationStats().subscribe((data: any[]) => {
      const labels = data.map(d => {
        let role = (d.designation || 'Unknown').toLowerCase().trim();
        if (role === 'devloper') role = 'developer';
        return role.charAt(0).toUpperCase() + role.slice(1);
      });

      this.designationData = {
        labels,
        datasets: [{
          data: data.map(d => Number(d.count) || 0),
          backgroundColor: ['#00F5D4','#FF006E','#8338EC','#FFBE0B','#3A86FF','#FB5607','#06D6A0','#EF476F','#118AB2','#FFD166'],
          borderWidth: 2,
          borderColor: '#0f172a'
        }]
      };
      this.cdr.detectChanges();
      setTimeout(() => this.pieChart?.chart?.update(), 50);
    });

    // BAR
    this.employeeService.getDepartmentSalaryStats().subscribe((data: any[]) => {
      this.salaryData = {
        labels: data.map(d => d.department || 'Unknown'),
        datasets: [{
          label: 'Avg Salary',
          data: data.map(d => Number(d.avgSalary) || 0),
          backgroundColor: '#00F5D4',
          borderRadius: 8
        }]
      };
      this.cdr.detectChanges();
      setTimeout(() => this.barChart?.chart?.update(), 50);
    });

    // LINE
    this.employeeService.getEmployeeGrowth().subscribe((data: any[]) => {
      this.growthData = {
        labels: data.map(d => new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })),
        datasets: [{
          label: 'Employees Joined',
          data: data.map(d => Number(d.count) || 0),
          borderColor: '#00F5D4',
          backgroundColor: 'rgba(0,245,212,0.15)',
          fill: true,
          tension: 0.4,
          pointRadius: 4
        }]
      };
      this.cdr.detectChanges();
      setTimeout(() => this.lineChart?.chart?.update(), 50);
    });
  }
}