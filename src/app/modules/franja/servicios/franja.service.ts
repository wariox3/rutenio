import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';
import { RespuestaApi } from '../../../core/types/api.type';

@Injectable({
  providedIn: 'root',
})
export class FranjaService {
  private _httpService = inject(HttpService);

  lista(parametros: any) {
    return this._httpService.post<any>(`general/funcionalidad/lista/`, parametros);
  }

  listaAutocompletar(modelo: string) {
    return this._httpService.post<{ cantidad_registros: number; registros: any[] }>(
      'general/funcionalidad/autocompletar/',
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
        limite: 0,
        desplazar: 0,
        ordenamientos: [],
        limite_conteo: 10000,
        modelo,
      }
    );
  }

  listaCiudades(arrFiltros: any) {
    return this._httpService.post<any[]>(
      'general/funcionalidad/autocompletar/',
      arrFiltros
    );
  }

  guardarFranja(data: any) {
    return this._httpService.post<any[]>(`ruteo/franja/`, data);
  }



  actualizarFranja(id: number, data: any) {
    return this._httpService.put<any>(`ruteo/franja/${id}/`, data);
  }

  eliminarFranja(id: number) {
    return this._httpService.delete(`ruteo/franja/${id}/`, {});
  }

  consultarDetalle(id: number) {
    return this._httpService.getDetalle<RespuestaApi<any>>(`ruteo/franja/${id}/`);
  }

  consultarFranjas() {
    return this._httpService.getDetalle<RespuestaApi<any>>(`ruteo/franja/`);
  }

  // Con ?lista=true el backend desactiva la paginación y responde un array
  // plano con TODAS las franjas (la lista normal pagina a 30).
  consultarFranjasTodas() {
    return this._httpService.getDetalle<any[]>(`ruteo/franja/?lista=true`);
  }

  importarArchivoKML(archivoEnBase64: string) {
    return this._httpService.post('ruteo/franja/importar/', {
      base64: archivoEnBase64,
    });
  }
}
