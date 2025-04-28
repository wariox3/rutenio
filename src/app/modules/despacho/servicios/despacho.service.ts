import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';
import { RespuestaGeneralLista } from '../../../interfaces/general/api.interface';
import {
  Despacho,
  DespachoDetalle,
} from '../../../interfaces/despacho/despacho.interface';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DespachoService {
  private _httpService = inject(HttpService);

  private actualizarListaSubject = new Subject<void>();

  actualizarLista$ = this.actualizarListaSubject.asObservable();

  notificarActualizacionLista() {
    this.actualizarListaSubject.next();
  }

  lista(parametros: any) {
    return this._httpService.post<RespuestaGeneralLista<Despacho>>(
      `general/funcionalidad/lista/`,
      parametros
    );
  }

  guardarGuias(data: any) {
    return this._httpService.post<any[]>(`ruteo/despacho/`, data);
  }

  consultarDetalle(id: number) {
    return this._httpService.getDetalle<DespachoDetalle>(
      `ruteo/despacho/${id}/`
    );
  }

  eliminarDespacho(id: number) {
    return this._httpService.delete(`ruteo/despacho/${id}/`, {});
  }

  actualizar(id: number, data: any) {
    return this._httpService.put<DespachoDetalle>(
      `ruteo/despacho/${id}/`,
      data
    );
  }

  guardar(data: any) {
    return this._httpService.post<DespachoDetalle>(`ruteo/despacho/`, data);
  }

  terminarDespacho(id: number) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/despacho/terminar/`,
      {
        id,
      }
    );
  }

  importarVisitas(data: any) {
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

  adicionarVisita(id: number, visita_id, trafico?) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/despacho/visita-adicionar/`,
      {
        id,
        visita_id,
        trafico
      }
    );
  }

  consultarDocumento(despacho_id: any, numero: any) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/visita/consulta-documento/`,
      {
        despacho_id,
        numero,
      }
    );
  }

  trasbordar(id: number, despacho_origen_id) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/despacho/trasbordar/`,
      {
        id,
        despacho_origen_id
      }
    );
  }
}
