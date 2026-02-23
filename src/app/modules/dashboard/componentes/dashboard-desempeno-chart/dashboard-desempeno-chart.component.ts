import { Component, ChangeDetectionStrategy, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DesempenoEntregas } from '../../../../interfaces/dashboard/dashboard.interface';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexDataLabels,
  ApexTooltip,
  ApexLegend,
  ApexGrid,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
  legend: ApexLegend;
  grid: ApexGrid;
  colors: string[];
};

@Component({
  selector: 'app-dashboard-desempeno-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard-desempeno-chart.component.html',
  styleUrl: './dashboard-desempeno-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardDesempenoChartComponent implements OnChanges {
  @Input({ required: true }) datos!: DesempenoEntregas;

  chartOptions!: ChartOptions;

  ngOnChanges(): void {
    this.actualizarChart();
  }

  private actualizarChart(): void {
    if (!this.datos) return;

    this.chartOptions = {
      series: [
        { name: 'OTIF %', data: this.datos.otifPorcentaje },
        { name: 'A Tiempo %', data: this.datos.aTiempoPorcentaje },
      ],
      chart: {
        type: 'line',
        height: 300,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      colors: ['#0098d7', '#f7c74d'],
      stroke: { curve: 'smooth', width: 3 },
      dataLabels: { enabled: false },
      xaxis: {
        categories: this.datos.fechas,
        labels: { style: { colors: '#575757', fontSize: '11px' } },
      },
      yaxis: {
        min: 50,
        max: 100,
        labels: {
          style: { colors: '#575757', fontSize: '11px' },
          formatter: (val: number) => `${val}%`,
        },
      },
      tooltip: {
        y: { formatter: (val: number) => `${val}%` },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '12px',
        labels: { colors: '#575757' },
      },
      grid: {
        borderColor: '#f1f1f1',
        strokeDashArray: 4,
      },
    };
  }
}
