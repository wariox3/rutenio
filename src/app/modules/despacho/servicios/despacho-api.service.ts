import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';
import { DespachoDetalle } from '../../../interfaces/despacho/despacho.interface';
import { GeneralService } from '../../../common/services/general.service';

@Injectable({
  providedIn: 'root',
})
export class DespachoApiService {
  private _httpService = inject(HttpService);
  private _generalService = inject(GeneralService);

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

  adicionarVisita(despacho_id: number, visita_id: number) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/despacho/visita-adicionar/`,
      {
        id: despacho_id,
        visita_id,
      }
    );
  }

  trasbordar(id: number, despacho_origen_id: number) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/despacho/trasbordar/`,
      {
        id,
        despacho_origen_id
      }
    );
  }

  descargarPlanoSemantica(id: number) {
    this._generalService.descargarArchivo('ruteo/despacho/plano-semantica/', {
      id,
    });
  }
}
