import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../common/services/http.service';
import {
  WhatsappConexion,
  WhatsappConexionUpsert,
  WhatsappProbarRespuesta,
} from '../interfaces/conexion.interface';
import {
  Conversacion,
  ListaConversaciones,
} from '../interfaces/conversacion.interface';
import {
  Mensaje,
  PayloadEnvio,
  RespuestaEnvio,
} from '../interfaces/mensaje.interface';

@Injectable({ providedIn: 'root' })
export class MensajeriaApiService {
  private _http = inject(HttpService);

  // === Conexión ===
  obtenerConexion(): Observable<WhatsappConexion> {
    return this._http.getDetalle<WhatsappConexion>('mensajeria/conexion/');
  }

  guardarConexion(datos: WhatsappConexionUpsert): Observable<WhatsappConexion> {
    return this._http.post<WhatsappConexion>('mensajeria/conexion/', datos);
  }

  probarConexion(): Observable<WhatsappProbarRespuesta> {
    return this._http.post<WhatsappProbarRespuesta>('mensajeria/conexion/probar/', {});
  }

  // === Conversaciones ===
  listarConversaciones(parametros: Record<string, any> = {}): Observable<ListaConversaciones> {
    const query = new URLSearchParams(parametros as Record<string, string>).toString();
    const endpoint = query ? `mensajeria/conversacion/?${query}` : 'mensajeria/conversacion/';
    return this._http.getDetalle<ListaConversaciones>(endpoint);
  }

  obtenerConversacion(id: number): Observable<Conversacion> {
    return this._http.getDetalle<Conversacion>(`mensajeria/conversacion/${id}/`);
  }

  listarMensajes(conversacionId: number): Observable<Mensaje[]> {
    return this._http.getDetalle<Mensaje[]>(`mensajeria/conversacion/${conversacionId}/mensajes/`);
  }

  enviarMensaje(conversacionId: number, payload: PayloadEnvio): Observable<RespuestaEnvio> {
    return this._http.post<RespuestaEnvio>(`mensajeria/conversacion/${conversacionId}/enviar/`, payload);
  }

  marcarLeido(conversacionId: number): Observable<{ ok: boolean }> {
    return this._http.post<{ ok: boolean }>(`mensajeria/conversacion/${conversacionId}/marcar-leido/`, {});
  }

  cerrarConversacion(conversacionId: number): Observable<Conversacion> {
    return this._http.post<Conversacion>(`mensajeria/conversacion/${conversacionId}/cerrar/`, {});
  }

  reabrirConversacion(conversacionId: number): Observable<Conversacion> {
    return this._http.post<Conversacion>(`mensajeria/conversacion/${conversacionId}/reabrir/`, {});
  }
}
