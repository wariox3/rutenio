import { Component, ChangeDetectionStrategy, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
} from 'ng-apexcharts';
import { DatoDiario } from '../../../../interfaces/dashboard/dashboard.interface';

@Component({
  selector: 'app-dashboard-cumplimiento-zona',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard-cumplimiento-zona.component.html',
  styleUrl: './dashboard-cumplimiento-zona.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCumplimientoZonaComponent implements OnChanges {
  @Input({ required: true }) datos!: DatoDiario[];

  series: ApexAxisChartSeries = [];
  chartOptions: any = {};

  ngOnChanges(): void {
    this.series = [
      {
        name: 'Entregas',
        data: this.datos.map(d => d.entregas),
      },
      {
        name: 'Sin Novedad',
        data: this.datos.map(d => d.sinNovedad),
      },
    ];

    this.chartOptions = {
      chart: {
        type: 'line',
        height: 220,
        toolbar: { show: false },
        sparkline: { enabled: false },
        zoom: { enabled: false },
        animations: { enabled: true, easing: 'easeinout', speed: 600 },
        fontFamily: 'inherit',
      },
      stroke: {
        curve: 'smooth',
        width: 2.5,
      },
      colors: ['#0098d7', '#17c653'],
      markers: {
        size: 4,
        strokeWidth: 2,
        strokeColors: '#fff',
        hover: { size: 6 },
      },
      xaxis: {
        categories: this.datos.map(d => d.dia),
        labels: {
          style: { fontSize: '11px', colors: '#9aa5b4' },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        min: 0,
        max: 100,
        tickAmount: 4,
        labels: {
          formatter: (val: number) => `${val}%`,
          style: { fontSize: '11px', colors: '#9aa5b4' },
        },
      },
      grid: {
        borderColor: '#f0f0f0',
        strokeDashArray: 4,
        padding: { left: 0, right: 10 },
      },
      tooltip: {
        y: { formatter: (val: number) => `${val}%` },
        theme: 'light',
      },
      legend: { show: false },
      dataLabels: { enabled: false },
    };
  }

  get ultimoEntregas(): number {
    return this.datos.length > 0 ? this.datos[this.datos.length - 1].entregas : 0;
  }
}
