import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';
import { RespuestaGeneralLista } from '../../../interfaces/general/api.interface';
import { Novedad } from '../interfaces/novedad.interface';

@Injectable({
  providedIn: 'root',
})
export class NovedadService {
  private _httpService = inject(HttpService);

  lista(parametros: any) {
    return this._httpService.post<RespuestaGeneralLista<Novedad>>(
      `general/funcionalidad/lista/`,
      parametros
    );
  }

  guardarNovedad(data: any) {
    return this._httpService.post<any[]>(`ruteo/novedad/`, data);
  }

  consultarDetalle(id: number) {
    return this._httpService.getDetalle<any>(`ruteo/novedad/${id}/`);
  }

  eliminarDespacho(id: number) {
    return this._httpService.delete(`ruteo/despacho/${id}/`, {});
  }

  terminarDespacho(id: number) {
    return this._httpService.post<{ mensaje: string }>(`ruteo/despacho/terminar/`, {
      id,
    });
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

}
