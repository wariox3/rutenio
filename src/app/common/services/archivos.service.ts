import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ArchivosService {

  constructor(private _httpService: HttpService) { }


  descargarArchivoGeneral(payload: { id: number }) {
    return this._httpService.descargarArchivo(
      'general/archivo/descargar/',
      payload,
    );
  }

}
