import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';
import { RespuestaApi } from '../../../core/types/api.type';
import { GeneralApiService } from '../../../core';

@Injectable({
  providedIn: 'root',
})
export class ComplementoService {

  private http = inject(HttpService);
  private _generalApiService = inject(GeneralApiService);

  constructor() {}

  listarComplementos() {
    return this.http.getDetalle<RespuestaApi<any>>(`general/complemento/`);
  }

  complementosInstalados() {
    return this._generalApiService.consultaApi<RespuestaApi<any>>('general/complemento/', {
      instalado: 'True'
    })
  }

  desinstalarComplemento(complemento: any) {
    const complementoActualizado = { ...complemento, instalado: false };
    return this.actualizarComplemento(complemento.id, complementoActualizado);
  }

  actualizarComplemento(id: any, data: any) {
    return this.http.put<any>(`general/complemento/${id}/`, data);
  }

  validarComplemento(id){
    return this.http.post<any>(`general/complemento/validar/`, {
      "id": id
    })
  }

  marcarComoInstalado(complemento: any) {
    const complementoActualizado = { ...complemento, instalado: true };
    return this.actualizarComplemento(complemento.id, complementoActualizado);
  }

}
