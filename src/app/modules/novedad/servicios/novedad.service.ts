import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';
import { RespuestaGeneralLista } from '../../../interfaces/general/api.interface';
import { Novedad } from '../interfaces/novedad.interface';
import { RespuestaAutocompletar } from '../../../interfaces/general/autocompletar.interface';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NovedadService {
  private _httpService = inject(HttpService);

  private actualizarListaSubject = new Subject<void>();

  actualizarLista$ = this.actualizarListaSubject.asObservable();

  notificarActualizacionLista() {
    this.actualizarListaSubject.next();
  }

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

  listaAutocompletar<T>(modelo: string) {
    return this._httpService.post<RespuestaAutocompletar<T>>(
      'general/funcionalidad/lista/',
      {
        filtros: [
          {
            id: '1692284537644-1688',
            operador: 'icontains',
            propiedad: 'nombre',
            valor1: ``,
            valor2: '',
          },
        ],
        limite: 1000,
        desplazar: 0,
        ordenamientos: [],
        limite_conteo: 10000,
        modelo,
        serializador: 'ListaAutocompletar',
      }
    );
  }

  solucionarNovedad(data: any) {
    return this._httpService.post<any[]>(`ruteo/novedad/solucionar/`, data);
  }

  enviarNovedadComplemento() {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/novedad/nuevo_complemento/`,
      {}
    );
  }

}
