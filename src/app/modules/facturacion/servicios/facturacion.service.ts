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

  facturacion(usuario_id: string) {
    return this.http.post<Facturas>(
      `${environment.url_api}/contenedor/movimiento/pendiente/`,
      {
        usuario_id,
      }
    );
  }

  facturacionFechas(usuario_id: string, fechaHasta: any) {
    return this.http.post<Consumos>(
      `${environment.url_api}/contenedor/consumo/consulta-usuario-fecha/`,
      {
        usuario_id,
        fechaDesde: this.fechaServices.obtenerPrimerDiaDelMes(new Date()),
        fechaHasta: fechaHasta
      }
    );
  }

  obtenerUsuarioVrSaldo(usuario_id: string) {
    return this.http.get<{ saldo: number, credito: number, abono: number }>(
      `${environment.url_api}/seguridad/usuario/saldo/${usuario_id}/`,
    );
  }

  informacionFacturacion(usuario_id: string) {
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

  actualizarDatosInformacionFacturacion(informacion_id: any, data: any) {
    return this.http.put<{ informacion_id: any; data: any }>(
      `${environment.url_api}/contenedor/informacion_facturacion/${informacion_id}/`,
      data,
    );
  }

  eliminarInformacionFacturacion(informacion_id: any) {
    return this.http.delete<{ informacion_id: any }>(
      `${environment.url_api}/contenedor/informacion_facturacion/${informacion_id}/`,
    );
  }


}
