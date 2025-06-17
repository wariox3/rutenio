import { Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';
import { Empresa } from '../../../redux/actions/contenedor/empresa.interface';

@Injectable({
  providedIn: 'root',
})
export class EmpresaService {
  constructor(private httpService: HttpService) {}

  cargarLogo(empresa_id: any, imagenB64: string) {
    return this.httpService.post<{ cargar: boolean; imagen: string }>(
      `general/empresa/cargar-logo/`,
      {
        empresa_id,
        imagenB64,
      }
    );
  }

  eliminarLogoEmpresa(empresa_id: Number | string) {
    return this.httpService.post<{
      limpiar: boolean;
      imagen: string;
    }>(`general/empresa/limpiar-logo/`, {
      empresa_id,
    });
  }

  detalle(){
    return this.httpService.get<Empresa>('general/empresa/1/')
  }

}
