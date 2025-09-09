import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';
import { ParametrosConsulta } from '../../../interfaces/general/api.interface';
import {
  ParametrosDireccionAlternativa,
  VisitaResumen,
} from '../../../interfaces/visita/rutear.interface';
import { ParametrosApi } from '../../../core/types/api.type';

@Injectable({
  providedIn: 'root',
})
export class VisitaApiService {
  private _httpService = inject(HttpService);

  consultarDocumento(payload: {
    despacho_id?: number;
    numero: number;
    estado_despacho?: boolean;
  }) {
    return this._httpService.post<{ id: number }>(
      `ruteo/visita/consulta-documento/`,
      {
        ...payload,
      }
    );
  }

  lista(data: any) {
    return this._httpService.post<any[]>(`ruteo/visita/lista/`, data);
  }

  guardar(data: any) {
    return this._httpService.post<any[]>(`ruteo/visita/nuevo/`, data);
  }

  getDetalle(id: number) {
    return this._httpService.getDetalle<any>(`ruteo/visita/${id}/`);
  }

  importarPorExcel(data: any) {
    return this._httpService.post<any[]>(`ruteo/visita/importar-excel/`, data);
  }

  actualizar(id: number, data: any) {
    return this._httpService.put<any>(`ruteo/visita/${id}/`, data);
  }

  actualizarDireccion(parametros: any) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/visita/actualizar-direccion/`,
      parametros
    );
  }

  decodificar() {
    return this._httpService.post<any[]>(`ruteo/visita/decodificar/`, '');
  }

  decodificarExterno(data: any) {
    return this._httpService.post<any[]>(
      `ruteo/visita/decodificar-externo/`,
      data
    );
  }

  ordenar(parametros?: ParametrosApi) {
    return this._httpService.post<any[]>(`ruteo/visita/ordenar/`, parametros);
  }

  rutear(parametros?: ParametrosConsulta) {
    return this._httpService.post<any[]>(`ruteo/visita/rutear/`, parametros);
  }

  retirar(id: number) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/visita/despacho-retirar/`,
      {
        id,
      }
    );
  }

  eliminarPorId(id: number) {
    return this._httpService.delete(`ruteo/visita/${id}/`, {});
  }

  liberar(id: string) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/visita/liberar/`,
      {
        id,
      }
    );
  }

  adicionar(despacho_id: number, visita_id: number) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/despacho/visita-adicionar/`,
      {
        id: despacho_id,
        visita_id,
      }
    );
  }

  eliminarPorIds(data: number[]) {
    return this._httpService.post(`ruteo/visita/eliminar/`, {
      documentos: data,
    });
  }

  eliminarTodos() {
    return this._httpService.post('ruteo/visita/eliminar-todos/', {});
  }

  eliminarTodosConErrores() {
    return this._httpService.post('ruteo/visita/eliminar-todos/', {
      estado_decodificado: false,
    });
  }

  resumen(parametros?: ParametrosConsulta) {
    return this._httpService.post<VisitaResumen>(
      'ruteo/visita/resumen/',
      parametros
    );
  }

  resumenPendiente(filtros: any[]) {
    return this._httpService.post<VisitaResumen>(
      'ruteo/visita/resumen-pendiente/',
      {
        filtros,
        limite: 50,
        desplazar: 0,
        ordenamientos: [
          'estado_decodificado',
          '-estado_decodificado_alerta',
          'orden',
        ],
      }
    );
  }

  importarPorComplemento(parametros: {
    numeroRegistros: number;
    desde: number | string;
    hasta: number | string;
    pendienteDespacho: boolean;
    complemento: number;
    codigo_contacto: number;
    codigo_destino: number;
    codigo_zona: string;
    fecha_desde: Date;
    fecha_hasta: Date;
    codigo_despacho: number;
  }) {
    return this._httpService.post(`ruteo/visita/importar-complemento/`, {
      limite: parametros.numeroRegistros,
      guia_desde: parametros.desde,
      guia_hasta: parametros.hasta,
      pendiente_despacho: parametros.pendienteDespacho,
      complemento: parametros.complemento,
      codigo_contacto: parametros.codigo_contacto,
      codigo_destino: parametros.codigo_destino,
      codigo_zona: parametros.codigo_zona,
      fecha_desde: parametros.fecha_desde,
      fecha_hasta: parametros.fecha_hasta,
      codigo_despacho: parametros.codigo_despacho
    });
  }

  ubicarFranja(parametros?: ParametrosApi) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/visita/ubicar/`,
      parametros
    );
  }

  seleccionarDireccionAlternativa(parametros: ParametrosDireccionAlternativa) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/visita/seleccionar-direccion-alternativa/`,
      parametros
    );
  }

  enviarEntregaComplemento() {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/visita/entrega-complemento/`,
      {}
    );
  }

  cambiarDespacho(visitaId: number, despachoId: number) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/visita/despacho-cambiar/`,
      {
        id: visitaId,
        despacho_id: despachoId,
      }
    );
  }
}
