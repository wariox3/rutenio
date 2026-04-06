import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { getCookie } from 'typescript-cookie';
import { AdminNavComponent } from '../../../../common/components/admin-nav/admin-nav.component';
import {
  AdminEntregasDetalleRespuesta,
  DespachoDetalle,
} from '../../interfaces/admin-entregas.interface';

@Component({
  selector: 'app-contenedor-admin-entregas-detalle',
  standalone: true,
  imports: [CommonModule, AdminNavComponent, RouterLink],
  templateUrl: './contenedor-admin-entregas-detalle.component.html',
})
export default class ContenedorAdminEntregasDetalleComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  empresa: { contenedor_id: number; schema_name: string; nombre: string } | null = null;
  despachos: DespachoDetalle[] = [];
  cargando = false;
  schemaName = '';
  fechaDesde = '';
  fechaHasta = '';
  despachoExpandido: number | null = null;

  private get headers(): HttpHeaders {
    const token = getCookie('admin_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  ngOnInit(): void {
    this.schemaName = this.route.snapshot.params['schema'];
    this.fechaDesde = this.route.snapshot.queryParams['desde'] || '';
    this.fechaHasta = this.route.snapshot.queryParams['hasta'] || '';

    if (!this.fechaDesde || !this.fechaHasta) {
      const hoy = new Date();
      this.fechaHasta = hoy.toISOString().substring(0, 10);
      const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      this.fechaDesde = primerDia.toISOString().substring(0, 10);
    }

    this.consultar();
  }

  consultar() {
    this.cargando = true;
    this.http
      .get<AdminEntregasDetalleRespuesta>(
        `${environment.url_api}/contenedor/contenedor/admin-entregas/${this.schemaName}/`,
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
          this.empresa = resp.empresa;
          this.despachos = resp.despachos;
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
        },
      });
  }

  toggleDespacho(id: number) {
    this.despachoExpandido = this.despachoExpandido === id ? null : id;
  }

  calcularCumplimiento(entregadas: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((entregadas / total) * 1000) / 10;
  }

  get totalVisitas(): number {
    return this.despachos.reduce((acc, d) => acc + d.visitas, 0);
  }

  get totalEntregadas(): number {
    return this.despachos.reduce((acc, d) => acc + d.visitas_entregadas, 0);
  }

  get totalNovedades(): number {
    return this.despachos.reduce((acc, d) => acc + d.visitas_novedad, 0);
  }
}
