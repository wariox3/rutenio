import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';
import { RespuestaGeneralLista } from '../../../interfaces/general/api.interface';
import {
  Despacho,
  DespachoDetalle,
} from '../../../interfaces/despacho/despacho.interface';

@Injectable({
  providedIn: 'root',
})
export class DespachoService {
  private _httpService = inject(HttpService);

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
}
