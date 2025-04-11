import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Consumos, Facturas, Movimiento } from '../interfaces/Facturacion';
import { FechasService } from '../../../common/services/fechas.service';

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {
  movientos: Movimiento[];

  constructor(private http: HttpClient, private fechaServices: FechasService) { }

  facturacion(usuario_id: number) {
    return this.http.post<Facturas>(
      `${environment.url_api}/contenedor/movimiento/pendiente/`,
      {
        usuario_id,
      }
    );
  }

  facturacionFechas(usuario_id: number, fechaHasta: any) {
    return this.http.post<Consumos>(
      `${environment.url_api}/contenedor/consumo/consulta-usuario-fecha/`,
      {
        usuario_id,
        fechaDesde: this.fechaServices.obtenerPrimerDiaDelMes(new Date()),
        fechaHasta: fechaHasta
      }
    );
  }

  informacionFacturacion(usuario_id: number) {
    return this.http.post<any>(
      `${environment.url_api}/contenedor/informacion_facturacion/consulta-usuario/`,
      {
        usuario_id,
      }
    );
  }

  crearInformacionFacturacion(data: any) {
    return this.http.post<{ data: any }>(
      `${environment.url_api}/contenedor/informacion_facturacion/`,
      data,
    );
  }

  obtenerInformacionFacturacion(usuario_id: any) {
    return this.http.get<{ usuario_id: any }>(
      `${environment.url_api}/contenedor/informacion_facturacion/${usuario_id}/`,
    );
  }


}
