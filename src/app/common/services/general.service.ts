import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeneralService {
  constructor(private http: HttpService) {}

  importar(url: string, data: any) {
    return this.http.post<{ mensaje: string }>(url, data);
  }

  descargarArchivoLocal(fileUrl: string, nombreArchivo: string) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = nombreArchivo;
    // Añadir el enlace al DOM y hacer clic en él para iniciar la descarga
    document.body.appendChild(link);
    link.click();
    // Eliminar el enlace del DOM
    document.body.removeChild(link);
  }
}
