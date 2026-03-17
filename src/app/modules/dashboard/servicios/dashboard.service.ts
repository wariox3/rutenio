import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { GeneralApiService } from '../../../core';
import { ParametrosApi, RespuestaApi } from '../../../core/types/api.type';
import { Despacho } from '../../../interfaces/despacho/despacho.interface';
import {
  CumplimientoZona,
  DashboardFiltros,
  DatoDiario,
  KpiIndicador,
  MarcadorMapa,
  UtilizacionFlota,
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

    const novedadesSinResolver$ = this._generalApiService.consultaApi<RespuestaApi<any>>(
      'ruteo/novedad/',
      { estado_solucion: 'False', limit: 1 }
    );

    const novedadesTotales$ = this._generalApiService.consultaApi<RespuestaApi<any>>(
      'ruteo/novedad/',
      { limit: 1 }
    );

    return forkJoin({
      despachosEnRuta: despachosEnRuta$,
      despachosTodos: despachosTodos$,
      visitaResumen: visitaResumen$,
      novedadesSinResolver: novedadesSinResolver$,
      novedadesTotales: novedadesTotales$,
    }).pipe(
      map(({ despachosEnRuta, despachosTodos, visitaResumen, novedadesSinResolver, novedadesTotales }) => {
        const todosDespachos = despachosTodos.results || [];
        const enRuta = despachosEnRuta.results || [];

        const totalVisitas = todosDespachos.reduce((acc, d) => acc + d.visitas, 0);
        const totalEntregadas = todosDespachos.reduce((acc, d) => acc + d.visitas_entregadas, 0);
        const totalNovedades = todosDespachos.reduce((acc, d) => acc + d.visitas_novedad, 0);

        const porcentajeEntrega = totalVisitas > 0
          ? Math.round((totalEntregadas / totalVisitas) * 1000) / 10
          : 0;

        const vehiculosEnRuta = new Set(enRuta.map(d => d.vehiculo)).size;

        const cantidadNovedadesSinResolver = Number(novedadesSinResolver.count) || 0;
        const cantidadNovedadesTotales = Number(novedadesTotales.count) || 0;
        const novedadesResueltas = cantidadNovedadesTotales - cantidadNovedadesSinResolver;
        const tasaResolucion = cantidadNovedadesTotales > 0
          ? Math.round((novedadesResueltas / cantidadNovedadesTotales) * 1000) / 10
          : 0;

        // Métricas de flota
        const despachosConCapacidad = todosDespachos.filter(d => d.vehiculo__capacidad > 0);
        const utilizacionFlota = despachosConCapacidad.length > 0
          ? Math.round(despachosConCapacidad.reduce((acc, d) => acc + (d.peso / d.vehiculo__capacidad) * 100, 0) / despachosConCapacidad.length * 10) / 10
          : 0;
        const pesoTotal = Math.round(todosDespachos.reduce((acc, d) => acc + d.peso, 0));
        const capacidadTotal = Math.round(despachosConCapacidad.reduce((acc, d) => acc + d.vehiculo__capacidad, 0));
        const volumenTotal = Math.round(todosDespachos.reduce((acc, d) => acc + d.volumen, 0) * 10) / 10;
        const unidadesTotal = todosDespachos.reduce((acc, d) => acc + d.unidades, 0);

        // Métricas de tiempo
        const tiempoServicioPromedio = todosDespachos.length > 0
          ? Math.round(todosDespachos.reduce((acc, d) => acc + d.tiempo_servicio, 0) / todosDespachos.length)
          : 0;
        const tiempoTrayectoPromedio = todosDespachos.length > 0
          ? Math.round(todosDespachos.reduce((acc, d) => acc + d.tiempo_trayecto, 0) / todosDespachos.length)
          : 0;

        const kpis: KpiIndicador[] = [
          // Row 1
          {
            titulo: 'OTIF',
            descripcion: 'Porcentaje de visitas entregadas sobre el total',
            detalleAyuda: 'OTIF (On-Time In-Full) mide el porcentaje de cumplimiento de entregas.\n\nFórmula: (Visitas Entregadas / Total Visitas) × 100\n\nMeta: 95%\n\nSe consideran todas las visitas de despachos aprobados y no anulados.',
            valor: porcentajeEntrega,
            unidad: '%',
            icono: 'ki-filled ki-chart-simple',
            colorIcono: '#f7c74d',
            meta: 95,
            subIndicadores: [
              { etiqueta: 'Entregadas', valor: totalEntregadas, color: '#0098d7' },
              { etiqueta: 'Total', valor: totalVisitas, color: '#575757' },
            ],
          },
          {
            titulo: 'Visitas Totales',
            descripcion: 'Total de visitas registradas en despachos',
            detalleAyuda: 'Cantidad total de visitas registradas en el sistema.\n\nIncluye visitas en todos los estados: pendientes, en ruta, entregadas y con novedad.\n\nSub-indicadores:\n• Unidades: cantidad de unidades/paquetes asociados\n• Peso: peso total en kg',
            valor: visitaResumen.resumen.cantidad,
            unidad: '',
            icono: 'ki-filled ki-geolocation',
            colorIcono: '#0098d7',
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
            icono: 'ki-filled ki-check-circle',
            colorIcono: '#17c653',
            subIndicadores: [
              { etiqueta: 'Exitosas', valor: totalEntregadas - totalNovedades, icono: 'ki-filled ki-check-circle', color: '#17c653' },
              { etiqueta: 'Novedad', valor: totalNovedades, icono: 'ki-filled ki-cross-circle', color: '#f1416c' },
            ],
          },
          // Row 2
          {
            titulo: 'Despachos en Ruta',
            descripcion: 'Despachos activos sin terminar',
            detalleAyuda: 'Cantidad de despachos que están actualmente en ruta (no terminados).\n\nSolo se cuentan despachos aprobados y no anulados.\n\nSub-indicadores:\n• Vehículos: cantidad de vehículos únicos en ruta\n• Despachos: total de despachos activos',
            valor: enRuta.length,
            unidad: '',
            icono: 'ki-filled ki-delivery-3',
            colorIcono: '#0098d7',
            subIndicadores: [
              { etiqueta: 'Vehículos activos', valor: vehiculosEnRuta, icono: 'ki-filled ki-delivery-3', color: '#0098d7' },
            ],
          },
          {
            titulo: 'Tiempo Promedio',
            descripcion: 'Tiempo promedio de servicio por despacho',
            detalleAyuda: 'Tiempo promedio que tarda un despacho en completar su servicio.\n\nFórmula: Suma(tiempo_servicio) / Total Despachos\n\nSub-indicadores:\n• Servicio: tiempo promedio en punto de entrega (min)\n• Trayecto: tiempo promedio de desplazamiento (min)',
            valor: tiempoServicioPromedio,
            unidad: 'min',
            icono: 'ki-filled ki-time',
            colorIcono: '#0098d7',
            subIndicadores: [
              { etiqueta: 'Trayecto', valor: tiempoTrayectoPromedio, icono: 'ki-filled ki-route', color: '#575757' },
            ],
          },
          {
            titulo: 'Carga Total',
            descripcion: 'Peso y capacidad total de los despachos',
            detalleAyuda: 'Resumen de la carga total procesada en todos los despachos aprobados.\n\nSub-indicadores:\n• Capacidad: kg disponibles totales\n• Volumen: metros cúbicos totales',
            valor: pesoTotal,
            unidad: 'kg',
            icono: 'ki-filled ki-package',
            colorIcono: '#7239ea',
            subIndicadores: [
              { etiqueta: 'Capacidad', valor: capacidadTotal, color: '#0098d7' },
              { etiqueta: 'Volumen m³', valor: volumenTotal, color: '#575757' },
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

  obtenerDatosGrafico(filtros: DashboardFiltros): Observable<DatoDiario[]> {
    const hoy = new Date();
    const hace7dias = new Date(hoy);
    hace7dias.setDate(hace7dias.getDate() - 6);

    const parametros: ParametrosApi = {
      estado_aprobado: 'True',
      estado_anulado: 'False',
      limit: 1000,
      fecha__gte: filtros.fechaDesde || hace7dias.toISOString().split('T')[0],
    };

    if (filtros.fechaHasta) {
      parametros['fecha__lte'] = filtros.fechaHasta;
    }

    return this._generalApiService.consultaApi<RespuestaApi<Despacho>>(
      'ruteo/despacho/',
      parametros
    ).pipe(
      map((respuesta) => {
        const despachos = respuesta.results || [];
        const porFecha = new Map<string, { visitas: number; entregadas: number; novedades: number }>();

        for (const d of despachos) {
          const fecha = d.fecha.split('T')[0];
          const existing = porFecha.get(fecha) || { visitas: 0, entregadas: 0, novedades: 0 };
          porFecha.set(fecha, {
            visitas: existing.visitas + d.visitas,
            entregadas: existing.entregadas + d.visitas_entregadas,
            novedades: existing.novedades + d.visitas_novedad,
          });
        }

        return Array.from(porFecha.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([fecha, datos]) => {
            const entregas = datos.visitas > 0 ? Math.round((datos.entregadas / datos.visitas) * 100) : 0;
            const sinNovedad = datos.visitas > 0
              ? Math.round(((datos.entregadas - datos.novedades) / datos.visitas) * 100)
              : 0;
            const date = new Date(fecha + 'T12:00:00');
            const dia = date.toLocaleDateString('es-CO', { weekday: 'short' });
            return { dia: dia.charAt(0).toUpperCase() + dia.slice(1), entregas, sinNovedad };
          });
      })
    );
  }

  obtenerUtilizacionFlota(filtros: DashboardFiltros): Observable<UtilizacionFlota> {
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

    return forkJoin({
      todos: this._generalApiService.consultaApi<RespuestaApi<Despacho>>('ruteo/despacho/', parametros),
      enRuta: this._generalApiService.consultaApi<RespuestaApi<Despacho>>('ruteo/despacho/', { ...parametros, estado_terminado: 'False' }),
    }).pipe(
      map(({ todos, enRuta }) => {
        const todosDespachos = todos.results || [];
        const activos = enRuta.results || [];

        const vehiculosActivos = new Set(activos.map(d => d.vehiculo)).size;
        const vehiculosTotales = new Set(todosDespachos.map(d => d.vehiculo)).size;
        const pesoTotal = Math.round(todosDespachos.reduce((acc, d) => acc + d.peso, 0));
        const conCapacidad = todosDespachos.filter(d => d.vehiculo__capacidad > 0);
        const capacidadTotal = Math.round(conCapacidad.reduce((acc, d) => acc + d.vehiculo__capacidad, 0));
        const porcentaje = capacidadTotal > 0
          ? Math.round((pesoTotal / capacidadTotal) * 1000) / 10
          : 0;

        const totalVisitas = todosDespachos.reduce((acc, d) => acc + d.visitas, 0);
        const totalEntregadas = todosDespachos.reduce((acc, d) => acc + d.visitas_entregadas, 0);
        const totalNovedades = todosDespachos.reduce((acc, d) => acc + d.visitas_novedad, 0);

        const entregas = totalVisitas > 0 ? Math.round((totalEntregadas / totalVisitas) * 100) : 0;
        const sinNovedad = totalVisitas > 0
          ? Math.round(((totalEntregadas - totalNovedades) / totalVisitas) * 100)
          : 0;

        return {
          vehiculosActivos,
          vehiculosTotales,
          pesoTotal,
          capacidadTotal,
          porcentaje,
          entregas,
          sinNovedad,
          criticos: totalNovedades,
        };
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
