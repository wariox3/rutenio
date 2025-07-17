import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';
import { Despacho, DespachoDetalle } from '../../../interfaces/despacho/despacho.interface';
import { GeneralService } from '../../../common/services/general.service';
import { GeneralApiService } from '../../../core';

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
    return this._generalApiService.getLista<Despacho[]>(parametros);
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
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/despacho/nuevo-complemento/`,
      {
        despacho_id,
      }
    );
  }

  descargarPlanoSemantica(id: number) {
    this._generalService.descargarArchivo('ruteo/despacho/plano-semantica/', {
      id,
    });
  }
}
