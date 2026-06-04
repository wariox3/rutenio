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
  TotalPlaca,
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
  truncado = signal(false);
  filas = signal<FilaReporteMensajero[]>([]);
  totalesPorMensajero = signal<TotalMensajero[]>([]);
  totalesPorPlaca = signal<TotalPlaca[]>([]);

  ngOnInit(): void {
    const hoy = new Date();
    this.fechaHasta = this.aFechaLocal(hoy);
    this.fechaDesde = this.aFechaLocal(
      new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    );
    this.consultar();
  }

  private aFechaLocal(d: Date): string {
    const anio = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  consultar(): void {
    if (!this.fechaDesde || !this.fechaHasta) return;
    this.cargando.set(true);
    this._despachoApiService
      .lista({
        // El backend (DRF) filtra el rango con fecha__gte / fecha__lte,
        // igual que el dashboard. Se excluyen los despachos anulados.
        fecha__gte: this.fechaDesde,
        fecha__lte: this.fechaHasta,
        estado_anulado: 'False',
        limit: 5000,
        ordering: '-fecha',
      })
      .subscribe({
        next: (respuesta) => {
          const resultados = respuesta.results ?? [];
          this.truncado.set((respuesta.count ?? 0) > resultados.length);
          this.procesar(resultados);
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

    // Agrupa por mensajero + placa + dia.
    const porDia = new Map<string, FilaReporteMensajero>();
    for (const d of enRango) {
      const dia = (d.fecha || '').substring(0, 10);
      const nombre = d.conductor_nombre || 'Sin asignar';
      const placa = d.vehiculo__placa || 'Sin placa';
      const clave = `${d.conductor_id ?? 'null'}|${placa}|${dia}`;
      let fila = porDia.get(clave);
      if (!fila) {
        fila = {
          conductorId: d.conductor_id,
          conductorNombre: nombre,
          placa,
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
          a.conductorNombre.localeCompare(b.conductorNombre) ||
          a.placa.localeCompare(b.placa)
      );

    // Agregado por mensajero (todos sus dias). dias = dias distintos.
    const porMensajero = new Map<string, TotalMensajero>();
    const diasMensajero = new Map<string, Set<string>>();
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
        diasMensajero.set(clave, new Set());
      }
      diasMensajero.get(clave)!.add(f.fecha);
      total.despachos += f.despachos;
      total.asignadas += f.asignadas;
      total.entregadas += f.entregadas;
      total.novedades += f.novedades;
    }

    const totalesCalculados = Array.from(porMensajero.entries())
      .map(([clave, t]) => ({
        ...t,
        dias: diasMensajero.get(clave)!.size,
        cumplimiento: this.calcularCumplimiento(t.entregadas, t.asignadas),
      }))
      .sort((a, b) => a.conductorNombre.localeCompare(b.conductorNombre));

    // Agregado por placa (todos sus dias). dias = dias distintos.
    const porPlaca = new Map<string, TotalPlaca>();
    const diasPlaca = new Map<string, Set<string>>();
    for (const f of filasCalculadas) {
      const clave = f.placa;
      let total = porPlaca.get(clave);
      if (!total) {
        total = {
          placa: f.placa,
          dias: 0,
          despachos: 0,
          asignadas: 0,
          entregadas: 0,
          novedades: 0,
          cumplimiento: 0,
        };
        porPlaca.set(clave, total);
        diasPlaca.set(clave, new Set());
      }
      diasPlaca.get(clave)!.add(f.fecha);
      total.despachos += f.despachos;
      total.asignadas += f.asignadas;
      total.entregadas += f.entregadas;
      total.novedades += f.novedades;
    }

    const totalesPlacaCalculados = Array.from(porPlaca.entries())
      .map(([clave, t]) => ({
        ...t,
        dias: diasPlaca.get(clave)!.size,
        cumplimiento: this.calcularCumplimiento(t.entregadas, t.asignadas),
      }))
      .sort((a, b) => a.placa.localeCompare(b.placa));

    this.filas.set(filasCalculadas);
    this.totalesPorMensajero.set(totalesCalculados);
    this.totalesPorPlaca.set(totalesPlacaCalculados);
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
      Placa: f.placa,
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

    const totalesPlaca = this.totalesPorPlaca().map((t) => ({
      Placa: t.placa,
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
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(totalesPlaca),
      'Totales por placa'
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
