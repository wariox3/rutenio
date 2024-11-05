import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';

@Injectable({
  providedIn: 'root',
})
export class DespachoService {
  private _httpService = inject(HttpService);

  lista(parametros: any) {
    return this._httpService.get<any>(`ruteo/despacho/`);
  }

  guardarGuias(data: any) {
    return this._httpService.post<any[]>(`ruteo/despacho/`, data);
  }

  consultarDetalle(id: number) {
    return this._httpService.getDetalle<any>(`ruteo/despacho/${id}/`);
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
}
