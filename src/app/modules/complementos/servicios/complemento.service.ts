import { Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';

@Injectable({
  providedIn: 'root',
})
export class ComplementoService {
  constructor(private http: HttpService) {}

  listarComplementos() {
    return this.http.get<any>(`general/complemento/`);
  }

  instalarComplemento(complemento: any) {
    const complementoActualizado = { ...complemento, instalado: true };
    return this.actualizarComplemento(complemento.id, complementoActualizado);
  }

  desinstalarComplemento(complemento: any) {
    const complementoActualizado = { ...complemento, instalado: false };
    return this.actualizarComplemento(complemento.id, complementoActualizado);
  }

  actualizarComplemento(id: any, data: any) {
    return this.http.put<any>(`general/complemento/${id}/`, data);
  }
}
