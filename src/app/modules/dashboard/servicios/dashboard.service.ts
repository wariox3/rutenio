import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { GeneralApiService } from '../../../core';
import { ParametrosApi, RespuestaApi } from '../../../core/types/api.type';
import { Despacho } from '../../../interfaces/despacho/despacho.interface';
import {
  CumplimientoZona,
  DashboardFiltros,
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

        const cantidadNovedades = Number(novedades.count) || 0;

        const kpis: KpiIndicador[] = [
          {
            titulo: 'OTIF',
            descripcion: 'Porcentaje de visitas entregadas sobre el total',
            detalleAyuda: 'OTIF (On-Time In-Full) mide el porcentaje de cumplimiento de entregas.\n\nFórmula: (Visitas Entregadas / Total Visitas) × 100\n\nMeta: 95%\n\nSe consideran todas las visitas de despachos aprobados y no anulados.',
            valor: porcentajeEntrega,
            unidad: '%',
            meta: 95,
            subIndicadores: [
              { etiqueta: 'Entregadas', valor: totalEntregadas, color: '#0098d7' },
              { etiqueta: 'Total', valor: totalVisitas, color: '#0098d7' },
            ],
          },
          {
            titulo: 'Visitas Totales',
            descripcion: 'Total de visitas registradas en despachos',
            detalleAyuda: 'Cantidad total de visitas registradas en el sistema.\n\nIncluye visitas en todos los estados: pendientes, en ruta, entregadas y con novedad.\n\nSub-indicadores:\n• Unidades: cantidad de unidades/paquetes asociados\n• Peso: peso total en kg',
            valor: visitaResumen.resumen.cantidad,
            unidad: '',
            subIndicadores: [
              { etiqueta: 'Unidades', valor: visitaResumen.resumen.unidades, color: '#0098d7' },
              { etiqueta: 'Peso', valor: Math.round(visitaResumen.resumen.peso), color: '#575757' },
            ],
          },
          {
            titulo: 'Visitas Entregadas',
            descripcion: 'Visitas completadas exitosamente',
            detalleAyuda: 'Cantidad de visitas que fueron entregadas al destinatario.\n\nSe obtiene sumando las visitas entregadas de todos los despachos aprobados.\n\nSub-indicadores:\n• Exitosas: entregas sin ninguna novedad\n• Novedad: entregas que presentaron alguna novedad',
            valor: totalEntregadas,
            unidad: '',
            subIndicadores: [
              { etiqueta: 'Exitosas', valor: totalEntregadas - totalNovedades, icono: 'ki-filled ki-check-circle', color: '#0098d7' },
              { etiqueta: 'Novedad', valor: totalNovedades, icono: 'ki-filled ki-cross-circle', color: '#f1416c' },
            ],
          },
          {
            titulo: 'Despachos en Ruta',
            descripcion: 'Despachos activos sin terminar',
            detalleAyuda: 'Cantidad de despachos que están actualmente en ruta (no terminados).\n\nSolo se cuentan despachos aprobados y no anulados.\n\nSub-indicadores:\n• Vehículos: cantidad de vehículos únicos en ruta\n• Despachos: total de despachos activos',
            valor: enRuta.length,
            unidad: '',
            subIndicadores: [
              { etiqueta: 'Vehículos', valor: vehiculosEnRuta, icono: 'ki-filled ki-delivery-3', color: '#0098d7' },
              { etiqueta: 'Despachos', valor: enRuta.length, icono: 'ki-filled ki-parcel', color: '#575757' },
            ],
          },
          {
            titulo: 'Novedades',
            descripcion: 'Novedades sin resolver',
            detalleAyuda: 'Cantidad de novedades que aún no han sido resueltas.\n\nSe consultan directamente del módulo de novedades filtrando por estado de solución pendiente.\n\nSub-indicadores:\n• Sin resolver: novedades abiertas que requieren atención',
            valor: cantidadNovedades,
            unidad: '',
            subIndicadores: [
              { etiqueta: 'Sin resolver', valor: cantidadNovedades, icono: 'ki-filled ki-information-3', color: '#f1416c' },
            ],
          },
          {
            titulo: 'Total Despachos',
            descripcion: 'Todos los despachos aprobados',
            detalleAyuda: 'Cantidad total de despachos aprobados y no anulados.\n\nSub-indicadores:\n• Activos: despachos en ruta (no terminados)\n• Terminados: despachos que ya completaron su recorrido',
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
          { zona: 'Entregas', descripcion: 'Porcentaje de visitas entregadas sobre el total de visitas.\nFórmula: (Entregadas / Total Visitas) × 100', sla: slaEntregas, color: obtenerColor(obtenerEstado(slaEntregas)), estado: obtenerEstado(slaEntregas) },
          { zona: 'Sin Novedad', descripcion: 'Porcentaje de entregas realizadas sin ninguna novedad.\nFórmula: (Entregadas - Novedades) / Total Visitas × 100', sla: slaSinNovedad, color: obtenerColor(obtenerEstado(slaSinNovedad)), estado: obtenerEstado(slaSinNovedad) },
          { zona: 'Despachos Terminados', descripcion: 'Porcentaje de despachos que completaron su recorrido.\nFórmula: Terminados / Total Despachos × 100', sla: slaTerminados, color: obtenerColor(obtenerEstado(slaTerminados)), estado: obtenerEstado(slaTerminados) },
          { zona: 'Retención', descripcion: 'Porcentaje de visitas que permanecen en su despacho original sin ser liberadas.\nFórmula: (Total Visitas - Liberadas) / Total Visitas × 100\nUn valor alto indica que las visitas se mantienen en sus despachos asignados.', sla: slaLiberadas, color: obtenerColor(obtenerEstado(slaLiberadas)), estado: obtenerEstado(slaLiberadas) },
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
