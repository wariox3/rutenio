import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ApexAxisChartSeries } from 'ng-apexcharts';
import { DatoDiario } from '../../../../interfaces/dashboard/dashboard.interface';

@Component({
  selector: 'app-dashboard-cumplimiento-zona',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard-cumplimiento-zona.component.html',
  styleUrl: './dashboard-cumplimiento-zona.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCumplimientoZonaComponent implements OnChanges, OnInit, OnDestroy {
  @Input({ required: true }) datos!: DatoDiario[];

  private cdr = inject(ChangeDetectorRef);
  private themeObserver: MutationObserver | null = null;

  series: ApexAxisChartSeries = [];
  chartOptions: any = {};

  ngOnInit(): void {
    this.themeObserver = new MutationObserver(() => {
      this.buildChart();
      this.cdr.markForCheck();
    });
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  ngOnChanges(): void {
    this.buildChart();
  }

  ngOnDestroy(): void {
    this.themeObserver?.disconnect();
  }

  private isDark(): boolean {
    return document.documentElement.classList.contains('dark');
  }

  private buildChart(): void {
    const dark = this.isDark();
    const labelColor = dark ? '#5e6278' : '#9aa5b4';
    const gridColor = dark ? '#2b2b40' : '#f0f0f0';
    const markerStroke = dark ? '#1e1e2d' : '#fff';

    this.series = [
      { name: 'Entregas', data: this.datos.map(d => d.entregas) },
      { name: 'Sin Novedad', data: this.datos.map(d => d.sinNovedad) },
    ];

    this.chartOptions = {
      chart: {
        type: 'line',
        height: 220,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true, easing: 'easeinout', speed: 600 },
        fontFamily: 'inherit',
        background: 'transparent',
      },
      stroke: { curve: 'smooth', width: 2.5 },
      colors: ['#0098d7', '#17c653'],
      markers: {
        size: 4,
        strokeWidth: 2,
        strokeColors: markerStroke,
        hover: { size: 6 },
      },
      xaxis: {
        categories: this.datos.map(d => d.dia),
        labels: { style: { fontSize: '11px', colors: labelColor } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        min: 0,
        max: 100,
        tickAmount: 4,
        labels: {
          formatter: (val: number) => `${val}%`,
          style: { fontSize: '11px', colors: labelColor },
        },
      },
      grid: {
        borderColor: gridColor,
        strokeDashArray: 4,
        padding: { left: 0, right: 10 },
      },
      tooltip: {
        y: { formatter: (val: number) => `${val}%` },
        theme: dark ? 'dark' : 'light',
      },
      legend: { show: false },
      dataLabels: { enabled: false },
    };
  }

  get ultimoEntregas(): number {
    return this.datos.length > 0 ? this.datos[this.datos.length - 1].entregas : 0;
  }
}
