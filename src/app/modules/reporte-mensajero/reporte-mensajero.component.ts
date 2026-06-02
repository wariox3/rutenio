import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { DespachoApiService } from '../despacho/servicios/despacho-api.service';
import { Despacho } from '../../interfaces/despacho/despacho.interface';
import {
  FilaReporteMensajero,
  TotalMensajero,
} from './interfaces/reporte-mensajero.interface';

@Component({
  selector: 'app-reporte-mensajero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-mensajero.component.html',
})
export default class ReporteMensajeroComponent implements OnInit {
  private _despachoApiService = inject(DespachoApiService);

  fechaDesde = '';
  fechaHasta = '';
  cargando = signal(false);
  consultado = signal(false);
  filas = signal<FilaReporteMensajero[]>([]);
  totalesPorMensajero = signal<TotalMensajero[]>([]);

  ngOnInit(): void {
    const hoy = new Date();
    this.fechaHasta = hoy.toISOString().substring(0, 10);
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.fechaDesde = primerDia.toISOString().substring(0, 10);
    this.consultar();
  }

  consultar(): void {
    if (!this.fechaDesde || !this.fechaHasta) return;
    this.cargando.set(true);
    this._despachoApiService
      .lista({
        fecha_desde: this.fechaDesde,
        fecha_hasta: this.fechaHasta,
        limit: 5000,
        ordering: '-fecha',
      })
      .subscribe({
        next: (respuesta) => {
          this.procesar(respuesta.results ?? []);
          this.consultado.set(true);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
        },
      });
  }

  private procesar(despachos: Despacho[]): void {
    // Red de seguridad: filtra por rango en el cliente por si el backend
    // ignora los parametros de fecha.
    const enRango = despachos.filter((d) => {
      const dia = (d.fecha || '').substring(0, 10);
      return dia >= this.fechaDesde && dia <= this.fechaHasta;
    });

    // Agrupa por mensajero + dia.
    const porDia = new Map<string, FilaReporteMensajero>();
    for (const d of enRango) {
      const dia = (d.fecha || '').substring(0, 10);
      const nombre = d.conductor_nombre || 'Sin asignar';
      const clave = `${d.conductor_id ?? 'null'}|${dia}`;
      let fila = porDia.get(clave);
      if (!fila) {
        fila = {
          conductorId: d.conductor_id,
          conductorNombre: nombre,
          fecha: dia,
          despachos: 0,
          asignadas: 0,
          entregadas: 0,
          novedades: 0,
          cumplimiento: 0,
        };
        porDia.set(clave, fila);
      }
      fila.despachos += 1;
      fila.asignadas += d.visitas || 0;
      fila.entregadas += d.visitas_entregadas || 0;
      fila.novedades += d.visitas_novedad || 0;
    }

    const filasCalculadas = Array.from(porDia.values())
      .map((f) => ({
        ...f,
        cumplimiento: this.calcularCumplimiento(f.entregadas, f.asignadas),
      }))
      .sort(
        (a, b) =>
          b.fecha.localeCompare(a.fecha) ||
          a.conductorNombre.localeCompare(b.conductorNombre)
      );

    // Agregado por mensajero (todos sus dias).
    const porMensajero = new Map<string, TotalMensajero>();
    for (const f of filasCalculadas) {
      const clave = `${f.conductorId ?? 'null'}`;
      let total = porMensajero.get(clave);
      if (!total) {
        total = {
          conductorId: f.conductorId,
          conductorNombre: f.conductorNombre,
          dias: 0,
          despachos: 0,
          asignadas: 0,
          entregadas: 0,
          novedades: 0,
          cumplimiento: 0,
        };
        porMensajero.set(clave, total);
      }
      total.dias += 1;
      total.despachos += f.despachos;
      total.asignadas += f.asignadas;
      total.entregadas += f.entregadas;
      total.novedades += f.novedades;
    }

    const totalesCalculados = Array.from(porMensajero.values())
      .map((t) => ({
        ...t,
        cumplimiento: this.calcularCumplimiento(t.entregadas, t.asignadas),
      }))
      .sort((a, b) => a.conductorNombre.localeCompare(b.conductorNombre));

    this.filas.set(filasCalculadas);
    this.totalesPorMensajero.set(totalesCalculados);
  }

  private calcularCumplimiento(entregadas: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((entregadas / total) * 1000) / 10;
  }

  descargarExcel(): void {
    const filas = this.filas();
    if (!filas.length) return;

    const detalle = filas.map((f) => ({
      Mensajero: f.conductorNombre,
      Fecha: f.fecha,
      Despachos: f.despachos,
      Asignadas: f.asignadas,
      Entregadas: f.entregadas,
      Novedades: f.novedades,
      '% Cumplimiento': f.cumplimiento,
    }));

    const totales = this.totalesPorMensajero().map((t) => ({
      Mensajero: t.conductorNombre,
      'Días': t.dias,
      Despachos: t.despachos,
      Asignadas: t.asignadas,
      Entregadas: t.entregadas,
      Novedades: t.novedades,
      '% Cumplimiento': t.cumplimiento,
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(detalle),
      'Detalle diario'
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(totales),
      'Totales por mensajero'
    );

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(data, `reporte_mensajero_${this.fechaDesde}_${this.fechaHasta}.xlsx`);
  }
}
