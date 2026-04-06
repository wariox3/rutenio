import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { getCookie } from 'typescript-cookie';
import { AdminNavComponent } from '../../../../common/components/admin-nav/admin-nav.component';
import {
  AdminEntregasRespuesta,
  AdminEntregasTotales,
  EntregaEmpresa,
} from '../../interfaces/admin-entregas.interface';

@Component({
  selector: 'app-contenedor-admin-entregas',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './contenedor-admin-entregas.component.html',
})
export default class ContenedorAdminEntregasComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  empresas: EntregaEmpresa[] = [];
  empresasOrdenadas: EntregaEmpresa[] = [];
  totales: AdminEntregasTotales | null = null;
  cargando = false;
  descargando = false;
  fechaDesde = '';
  fechaHasta = '';

  ordenColumna: string = 'nombre';
  ordenDireccion: 'asc' | 'desc' = 'asc';

  private get headers(): HttpHeaders {
    const token = getCookie('admin_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  ngOnInit(): void {
    const qDesde = this.route.snapshot.queryParams['desde'];
    const qHasta = this.route.snapshot.queryParams['hasta'];
    if (qDesde && qHasta) {
      this.fechaDesde = qDesde;
      this.fechaHasta = qHasta;
    } else {
      const hoy = new Date();
      this.fechaHasta = hoy.toISOString().substring(0, 10);
      const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      this.fechaDesde = primerDia.toISOString().substring(0, 10);
    }
    this.consultar();
  }

  consultar() {
    if (!this.fechaDesde || !this.fechaHasta) return;
    this.cargando = true;
    this.http
      .get<AdminEntregasRespuesta>(
        `${environment.url_api}/contenedor/contenedor/admin-entregas/`,
        {
          headers: this.headers,
          params: {
            fecha_desde: this.fechaDesde,
            fecha_hasta: this.fechaHasta,
          },
        }
      )
      .subscribe({
        next: (resp) => {
          this.empresas = resp.resultados;
          this.totales = resp.totales;
          this.aplicarOrden();
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
        },
      });
  }

  descargarExcel() {
    if (!this.fechaDesde || !this.fechaHasta) return;
    this.descargando = true;
    this.http
      .get(`${environment.url_api}/contenedor/contenedor/admin-entregas/`, {
        headers: this.headers,
        params: {
          fecha_desde: this.fechaDesde,
          fecha_hasta: this.fechaHasta,
          formato: 'xlsx',
        },
        responseType: 'blob',
        observe: 'response',
      })
      .subscribe({
        next: (response) => {
          const blob = response.body;
          if (blob) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `entregas_${this.fechaDesde}_${this.fechaHasta}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
          }
          this.descargando = false;
        },
        error: () => {
          this.descargando = false;
        },
      });
  }

  ordenarPor(columna: string) {
    if (this.ordenColumna === columna) {
      this.ordenDireccion = this.ordenDireccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenColumna = columna;
      this.ordenDireccion = 'desc';
    }
    this.aplicarOrden();
  }

  private aplicarOrden() {
    this.empresasOrdenadas = [...this.empresas].sort((a, b) => {
      const valA = (a as any)[this.ordenColumna];
      const valB = (b as any)[this.ordenColumna];
      let comparacion = 0;
      if (typeof valA === 'string') {
        comparacion = (valA || '').localeCompare(valB || '');
      } else {
        comparacion = (valA || 0) - (valB || 0);
      }
      return this.ordenDireccion === 'asc' ? comparacion : -comparacion;
    });
  }

  calcularCumplimiento(entregadas: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((entregadas / total) * 1000) / 10;
  }

  verDetalle(schemaName: string) {
    this.router.navigate(['/admin/entregas', schemaName], {
      queryParams: { desde: this.fechaDesde, hasta: this.fechaHasta },
    });
  }

  diasDesdeConexion(fecha: string | null): string {
    if (!fecha) return 'Sin conexión';
    const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    return `Hace ${diff} días`;
  }
}
