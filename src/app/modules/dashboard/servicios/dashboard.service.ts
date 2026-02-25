import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
import { GeneralApiService } from '../../../core';
import { ParametrosApi, RespuestaApi } from '../../../core/types/api.type';
import { Despacho } from '../../../interfaces/despacho/despacho.interface';
import {
  CumplimientoZona,
  DashboardFiltros,
  DesempenoEntregas,
  KpiIndicador,
  MarcadorMapa,
} from '../../../interfaces/dashboard/dashboard.interface';
import { VisitaApiService } from '../../visita/servicios/visita-api.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private _generalApiService = inject(GeneralApiService);
  private _visitaApiService = inject(VisitaApiService);

  obtenerKpis(filtros: DashboardFiltros): Observable<KpiIndicador[]> {
    const parametrosDespachos: ParametrosApi = {
      estado_aprobado: 'True',
      estado_anulado: 'False',
      limit: 1000,
    };

    if (filtros.fechaDesde) {
      parametrosDespachos['fecha__gte'] = filtros.fechaDesde;
    }
    if (filtros.fechaHasta) {
      parametrosDespachos['fecha__lte'] = filtros.fechaHasta;
    }

    const despachosEnRuta$ = this._generalApiService.consultaApi<RespuestaApi<Despacho>>(
      'ruteo/despacho/',
      { ...parametrosDespachos, estado_terminado: 'False' }
    );

    const despachosTodos$ = this._generalApiService.consultaApi<RespuestaApi<Despacho>>(
      'ruteo/despacho/',
      { ...parametrosDespachos, limit: 1000 }
    );

    const visitaResumen$ = this._visitaApiService.resumen({
      filtros: [],
      limite: 0,
      desplazar: 0,
      ordenamientos: [],
      limite_conteo: 10000,
      modelo: 'RutVisita',
    });

    const novedades$ = this._generalApiService.consultaApi<RespuestaApi<any>>(
      'ruteo/novedad/',
      { estado_solucion: 'False', limit: 1 }
    );

    return forkJoin({
      despachosEnRuta: despachosEnRuta$,
      despachosTodos: despachosTodos$,
      visitaResumen: visitaResumen$,
      novedades: novedades$,
    }).pipe(
      map(({ despachosEnRuta, despachosTodos, visitaResumen, novedades }) => {
        const todosDespachos = despachosTodos.results || [];
        const enRuta = despachosEnRuta.results || [];

        const totalVisitas = todosDespachos.reduce((acc, d) => acc + d.visitas, 0);
        const totalEntregadas = todosDespachos.reduce((acc, d) => acc + d.visitas_entregadas, 0);
        const totalNovedades = todosDespachos.reduce((acc, d) => acc + d.visitas_novedad, 0);

        const porcentajeEntrega = totalVisitas > 0
          ? Math.round((totalEntregadas / totalVisitas) * 1000) / 10
          : 0;

        const vehiculosEnRuta = new Set(enRuta.map(d => d.vehiculo)).size;

        const kpis: KpiIndicador[] = [
          {
            titulo: 'OTIF',
            valor: porcentajeEntrega,
            unidad: '%',
            meta: 95,
            subIndicadores: [
              { etiqueta: 'Entregadas', valor: totalEntregadas, color: '#0098d7' },
              { etiqueta: 'Total', valor: totalVisitas, color: '#0098d7' },
            ],
          },
          {
            titulo: 'Visitas',
            valor: visitaResumen.resumen.cantidad,
            unidad: '',
            subIndicadores: [
              { etiqueta: 'Unidades', valor: visitaResumen.resumen.unidades, color: '#0098d7' },
              { etiqueta: 'Peso', valor: Math.round(visitaResumen.resumen.peso), color: '#575757' },
            ],
          },
          {
            titulo: 'Entregadas',
            valor: totalEntregadas,
            unidad: '',
            subIndicadores: [
              { etiqueta: 'Exitosas', valor: totalEntregadas - totalNovedades, icono: 'ki-filled ki-check-circle', color: '#0098d7' },
              { etiqueta: 'Novedad', valor: totalNovedades, icono: 'ki-filled ki-cross-circle', color: '#f1416c' },
            ],
          },
          {
            titulo: 'En Ruta',
            valor: enRuta.length,
            unidad: '',
            subIndicadores: [
              { etiqueta: 'Vehículos', valor: vehiculosEnRuta, icono: 'ki-filled ki-delivery-3', color: '#0098d7' },
              { etiqueta: 'Despachos', valor: enRuta.length, icono: 'ki-filled ki-parcel', color: '#575757' },
            ],
          },
          {
            titulo: 'Novedades',
            valor: novedades.count || 0,
            unidad: '',
            subIndicadores: [
              { etiqueta: 'Sin resolver', valor: novedades.count || 0, icono: 'ki-filled ki-information-3', color: '#f1416c' },
            ],
          },
          {
            titulo: 'Despachos',
            valor: todosDespachos.length,
            unidad: '',
            subIndicadores: [
              { etiqueta: 'Activos', valor: enRuta.length, color: '#0098d7' },
              { etiqueta: 'Terminados', valor: todosDespachos.filter(d => d.estado_terminado).length, color: '#575757' },
            ],
          },
        ];

        return kpis;
      })
    );
  }

  // TODO: conectar a API real cuando exista endpoint de agregación histórica
  obtenerDesempeno(_filtros: DashboardFiltros): Observable<DesempenoEntregas> {
    const hoy = new Date();
    const fechas: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);
      fechas.push(fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }));
    }

    const desempeno: DesempenoEntregas = {
      fechas,
      otifPorcentaje: [82, 85, 83, 87, 86, 88, 87],
      aTiempoPorcentaje: [84, 86, 85, 88, 87, 90, 89],
    };
    return of(desempeno);
  }

  obtenerCumplimientoZona(filtros: DashboardFiltros): Observable<CumplimientoZona[]> {
    const parametros: ParametrosApi = {
      estado_aprobado: 'True',
      estado_anulado: 'False',
      limit: 1000,
    };

    if (filtros.fechaDesde) {
      parametros['fecha__gte'] = filtros.fechaDesde;
    }
    if (filtros.fechaHasta) {
      parametros['fecha__lte'] = filtros.fechaHasta;
    }

    return this._generalApiService.consultaApi<RespuestaApi<Despacho>>(
      'ruteo/despacho/',
      parametros
    ).pipe(
      map((respuesta) => {
        const despachos = respuesta.results || [];
        if (despachos.length === 0) {
          return [];
        }

        const totalVisitas = despachos.reduce((acc, d) => acc + d.visitas, 0);
        const totalEntregadas = despachos.reduce((acc, d) => acc + d.visitas_entregadas, 0);
        const totalNovedades = despachos.reduce((acc, d) => acc + d.visitas_novedad, 0);
        const totalLiberadas = despachos.reduce((acc, d) => acc + d.visitas_liberadas, 0);
        const terminados = despachos.filter(d => d.estado_terminado).length;

        const slaEntregas = totalVisitas > 0 ? Math.round((totalEntregadas / totalVisitas) * 100) : 0;
        const slaSinNovedad = totalVisitas > 0 ? Math.round(((totalEntregadas - totalNovedades) / totalVisitas) * 100) : 0;
        const slaTerminados = despachos.length > 0 ? Math.round((terminados / despachos.length) * 100) : 0;
        const slaLiberadas = totalVisitas > 0 ? Math.round(((totalVisitas - totalLiberadas) / totalVisitas) * 100) : 0;

        const obtenerEstado = (sla: number): 'ok' | 'alerta' | 'critico' => {
          if (sla >= 90) return 'ok';
          if (sla >= 70) return 'alerta';
          return 'critico';
        };

        const obtenerColor = (estado: 'ok' | 'alerta' | 'critico'): string => {
          if (estado === 'ok') return '#0098d7';
          if (estado === 'alerta') return '#f7c74d';
          return '#f1416c';
        };

        const zonas: CumplimientoZona[] = [
          { zona: 'Entregas', sla: slaEntregas, color: obtenerColor(obtenerEstado(slaEntregas)), estado: obtenerEstado(slaEntregas) },
          { zona: 'Sin Novedad', sla: slaSinNovedad, color: obtenerColor(obtenerEstado(slaSinNovedad)), estado: obtenerEstado(slaSinNovedad) },
          { zona: 'Despachos Terminados', sla: slaTerminados, color: obtenerColor(obtenerEstado(slaTerminados)), estado: obtenerEstado(slaTerminados) },
          { zona: 'Retención', sla: slaLiberadas, color: obtenerColor(obtenerEstado(slaLiberadas)), estado: obtenerEstado(slaLiberadas) },
        ];

        return zonas;
      })
    );
  }

  obtenerMarcadoresMapa(filtros: DashboardFiltros): Observable<MarcadorMapa[]> {
    const parametros: ParametrosApi = {
      estado_aprobado: 'True',
      estado_terminado: 'False',
      estado_anulado: 'False',
      limit: 1000,
    };

    if (filtros.fechaDesde) {
      parametros['fecha__gte'] = filtros.fechaDesde;
    }
    if (filtros.fechaHasta) {
      parametros['fecha__lte'] = filtros.fechaHasta;
    }

    return this._generalApiService.consultaApi<RespuestaApi<Despacho>>(
      'ruteo/despacho/',
      parametros
    ).pipe(
      map((respuesta) => {
        const despachos = respuesta.results || [];
        return despachos
          .filter(d => d.latitud && d.longitud)
          .map(d => ({
            lat: Number(d.latitud),
            lng: Number(d.longitud),
            tipo: (d.visitas_novedad > 0 ? 'incidencia' : 'entrega') as 'entrega' | 'incidencia',
            titulo: `${d.vehiculo__placa} - ${d.visitas_entregadas}/${d.visitas} entregas`,
          }));
      })
    );
  }
}
