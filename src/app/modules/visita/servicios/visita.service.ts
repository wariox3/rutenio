import { Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';
import { Visita } from '../../../interfaces/visita/visita.interface';
import {
  VisitaError,
  VisitaResumen,
} from '../../../interfaces/visita/rutear.interface';
import { RespuestaGeneralLista } from '../../../interfaces/general/api.interface';

@Injectable({
  providedIn: 'root',
})
export class VisitaService {
  constructor(private http: HttpService) {}

  lista(data: any) {
    return this.http.post<Visita[]>(`ruteo/visita/lista/`, data);
  }

  generalLista(data: any) {
    return this.http.post<RespuestaGeneralLista<Visita>>(`general/funcionalidad/lista/`, data);
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

  decodificar() {
    return this.http.post<any[]>(`ruteo/visita/decodificar/`, '');
  }

  ordenar() {
    return this.http.post<any[]>(`ruteo/visita/ordenar/`, '');
  }

  rutear() {
    return this.http.post<any[]>(`ruteo/visita/rutear/`, '');
  }

  eliminarVisita(id: number) {
    return this.http.delete(`ruteo/visita/${id}/`, {});
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

  visitaResumen() {
    return this.http.post<VisitaResumen>('ruteo/visita/resumen/', {});
  }

  visitaErrores() {
    return this.http.post<VisitaError>('ruteo/visita/error/', {});
  }

  importarComplementos(parametros: {
    numeroRegistros: number;
    desde: number;
    hasta: number;
    pendienteDespacho: boolean;
  }) {
    return this.http.post(`ruteo/visita/importar-complemento/`, {
      limite: parametros.numeroRegistros,
      guia_desde: parametros.desde,
      guia_hasta: parametros.hasta,
      pendiente_despacho: parametros.pendienteDespacho,
    });
  }
}
