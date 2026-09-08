import { RespuestaApi } from './../../../core/types/api.type';
import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';
import { Despacho, DespachoDetalle } from '../../../interfaces/despacho/despacho.interface';
import { GeneralService } from '../../../common/services/general.service';
import { GeneralApiService } from '../../../core';
import { ReporteEntregasZonaRespuesta } from '../../reporte-mensajero/interfaces/reporte-mensajero.interface';
import { TerminacionPreview } from '../../../interfaces/despacho/terminacion.interface';

@Injectable({
  providedIn: 'root',
})
export class DespachoApiService {
  private _httpService = inject(HttpService);
  private _generalService = inject(GeneralService);
  private _generalApiService = inject(GeneralApiService);

  obtenerRuta(id) {
    return this._httpService.post<any>(`ruteo/despacho/ruta/`, {
      id: id
    });
  }

  lista(parametros: any) {
    return this._generalApiService.consultaApi<RespuestaApi<Despacho>>('ruteo/despacho/', parametros);
  }

  reporteMensajero(parametros: any) {
    return this._generalApiService.consultaApi<RespuestaApi<Despacho>>('ruteo/reporte/mensajero/', parametros);
  }

  reporteMensajeroEntregas(parametros: any) {
    return this._generalApiService.consultaApi<ReporteEntregasZonaRespuesta>('ruteo/reporte/mensajero/entregas/', parametros);
  }

  descargarEntregasZonaExcel(parametros: { fecha_desde: string; fecha_hasta: string }) {
    const query = new URLSearchParams({ ...parametros, excel: '1' }).toString();
    this._httpService.descargarArchivoPorGet(`ruteo/reporte/mensajero/entregas/?${query}`);
  }

  descargarReporteMensajeroExcel(parametros: { fecha_desde: string; fecha_hasta: string }) {
    const query = new URLSearchParams({ ...parametros, excel: '1' }).toString();
    this._httpService.descargarArchivoPorGet(`ruteo/reporte/mensajero/?${query}`);
  }

  guardar(data: any) {
    return this._httpService.post<any[]>(`ruteo/despacho/`, data);
  }

  getDetalle(id: number) {
    return this._httpService.getDetalle<DespachoDetalle>(
      `ruteo/despacho/${id}/`
    );
  }

  eliminar(id: number) {
    return this._httpService.delete(`ruteo/despacho/${id}/`, {});
  }

  actualizar(id: number, data: any) {
    return this._httpService.put<DespachoDetalle>(
      `ruteo/despacho/${id}/`,
      data
    );
  }

  terminar(id: number) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/despacho/terminar/`,
      {
        id,
      }
    );
  }

  // Vista previa del Documento de Terminacion (no cierra el viaje).
  terminarPreview(id: number) {
    return this._httpService.post<TerminacionPreview>(
      `ruteo/despacho/terminar-preview/`,
      { id }
    );
  }

  // Descarga el PDF del Documento de Terminacion (desde el snapshot).
  descargarTerminacionPdf(id: number) {
    this._generalService.imprimir('ruteo/despacho/terminacion-pdf/', { id });
  }

  // Arranca el agente de WhatsApp (chequeo de novedades). El telefono lo indica
  // el despachador (despachos por placa); si va vacío, el backend cae al conductor.
  iniciarAgente(id: number, telefono?: string) {
    return this._httpService.post<{ ok: boolean; mensaje: string; telefono?: string }>(
      `ruteo/despacho/iniciar-agente/`,
      { id, telefono }
    );
  }

  importar(data: any) {
    return this._httpService.post<any[]>(`ruteo/despacho/importar/`, data);
  }

  decodificar() {
    return this._httpService.post<any[]>(`ruteo/despacho/decodificar/`, '');
  }

  ordenar() {
    return this._httpService.post<any[]>(`ruteo/despacho/ordenar/`, '');
  }

  aprobar(id: number) {
    return this._httpService.post<any[]>(`ruteo/despacho/aprobar/`, {
      id,
    });
  }

  anular(id: number) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/despacho/anular/`,
      {
        id,
      }
    );
  }

  regenerarIndicadorEntregas(id: number) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/despacho/regenerar-indicador-entregas/`,
      {
        id,
      }
    );
  }

  adicionarVisita(payload: {
    id: number;
    visita_id: number;
    trafico?: boolean;
  }) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/despacho/visita-adicionar/`,
      {
        ...payload,
      }
    );
  }

  trasbordar(id: number, despacho_origen_id: string) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/despacho/trasbordar/`,
      {
        id,
        despacho_origen_id,
      }
    );
  }

  nuevoComplemento(despacho_id: string) {
    return this._httpService.post<{
      mensaje: string;
      cantidad?: number;
      duplicadas?: number;
      sin_ubicar?: number;
      errores_guia?: number;
      descartadas?: number;
    }>(`ruteo/despacho/nuevo-complemento/`, {
      despacho_id,
    });
  }

  descargarPlanoSemantica(id: number) {
    this._generalService.descargarArchivo('ruteo/despacho/plano-semantica/', {
      id,
    });
  }
}
