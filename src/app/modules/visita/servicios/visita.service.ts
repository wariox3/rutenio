import { Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';
import { Visita } from '../../../interfaces/visita/visita.interface';
import { VisitaResumen } from '../../../interfaces/visita/rutear.interface';
import {
  ParametrosConsulta,
  RespuestaGeneralLista,
} from '../../../interfaces/general/api.interface';
import { Subject } from 'rxjs';
import {
  AutocompletarCiudades,
  RespuestaAutocompletar,
} from '../../../interfaces/general/autocompletar.interface';

@Injectable({
  providedIn: 'root',
})
export class VisitaService {
  constructor(private http: HttpService) {}

  private actualizarListaSubject = new Subject<void>();

  actualizarLista$ = this.actualizarListaSubject.asObservable();

  notificarActualizacionLista() {
    this.actualizarListaSubject.next();
  }

  generalLista(data: any) {
    return this.http.post<RespuestaGeneralLista<Visita>>(
      `general/funcionalidad/lista/`,
      data
    );
  }

  listaCiudades(arrFiltros: ParametrosConsulta) {
    return this.http.post<RespuestaAutocompletar<AutocompletarCiudades>>(
      'general/funcionalidad/lista/',
      arrFiltros
    );
  }

  cambiarDespachoVisita(visitaId: number, despachoId: number) {
    return this.http.post<{ mensaje: string }>(
      `ruteo/visita/despacho-cambiar/`,
      {
        id: visitaId,
        despacho_id: despachoId,
      }
    );
  }

  listarVisitas(data: any) {
    return this.http.post<any[]>(`ruteo/visita/lista/`, data);
  }

  guardarGuias(data: any) {
    return this.http.post<any[]>(`ruteo/visita/`, data);
  }

  consultarDetalle(id: number) {
    return this.http.getDetalle<any>(`ruteo/visita/${id}/`);
  }

  importarVisitas(data: any) {
    return this.http.post<any[]>(`ruteo/visita/importar-excel/`, data);
  }

  actualizarDatosVisita(id: number, data: any) {
    return this.http.put<any>(`ruteo/visita/${id}/`, data);
  }

  decodificar() {
    return this.http.post<any[]>(`ruteo/visita/decodificar/`, '');
  }

  decodificarExterno(data) {
    return this.http.post<any[]>(`ruteo/visita/decodificar-externo/`, data);
  }

  ordenar(parametros?: ParametrosConsulta) {
    return this.http.post<any[]>(`ruteo/visita/ordenar/`, parametros);
  }

  rutear(parametros?: ParametrosConsulta) {
    return this.http.post<any[]>(`ruteo/visita/rutear/`, parametros);
  }

  eliminarVisita(id: number) {
    return this.http.delete(`ruteo/visita/${id}/`, {});
  }

  retirarVisita(id: number) {
    return this.http.post<{ mensaje: string }>(
      `ruteo/visita/despacho-retirar/`,
      {
        id,
      }
    );
  }

  consultarDocumento(despacho_id: any, numero: any) {
    return this.http.post<{ id: string }>(`ruteo/visita/consulta-documento/`, {
      despacho_id,
      numero,
    });
  }

  liberar(id: string) {
    return this.http.post<{ mensaje: string }>(`ruteo/visita/liberar/`, {
      id,
    });
  }

  consultarDocumentoVisita(numero: any) {
    return this.http.post<{ id: string }>(`ruteo/visita/consulta-documento/`, {
      estado_despacho: false,
      numero,
    });
  }

  adicionar(despacho_id: number, visita_id: number) {
    return this.http.post<{ mensaje: string }>(`ruteo/despacho/visita-adicionar/`, {
      id: despacho_id,
      visita_id,
    });
  }

  eliminarMultiples(data: number[]) {
    return this.http.post(`ruteo/visita/eliminar/`, { documentos: data });
  }

  eliminarVisitasConErrores() {
    return this.http.post(`ruteo/visita/eliminar-todos/`, {
      estado_decodificado: false,
    });
  }

  eliminarTodosLasGuias() {
    return this.http.post('ruteo/visita/eliminar-todos/', {});
  }

  visitaResumen(parametros?: ParametrosConsulta) {
    return this.http.post<VisitaResumen>('ruteo/visita/resumen/', parametros);
  }

  resumenPendiente(parametros?: ParametrosConsulta) {
    return this.http.post<VisitaResumen>(
      'ruteo/visita/resumen-pendiente/',
      parametros
    );
  }

  importarComplementos(parametros: {
    numeroRegistros: number;
    desde: number | string;
    hasta: number | string;
    pendienteDespacho: boolean;
    complemento: number;
  }) {
    return this.http.post(`ruteo/visita/importar-complemento/`, {
      limite: parametros.numeroRegistros,
      guia_desde: parametros.desde,
      guia_hasta: parametros.hasta,
      pendiente_despacho: parametros.pendienteDespacho,
      complemento: parametros.complemento,
    });
  }

  actualizarDireccion(parametros: any){
    return this.http.post<{ mensaje: string }>(
      `ruteo/visita/actualizar-direccion/`,
      parametros
    );
  }
}
