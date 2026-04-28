import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface ContenedorGlobal {
  id: number;
  schema_name: string;
  nombre: string;
  fecha: string;
  usuarios: number;
  acceso_whatsapp: boolean;
  acceso_whatsapp_notificaciones: boolean;
  whatsapp_phone_number_id: string | null;
  whatsapp_display: string | null;
  whatsapp_estado: string | null;
}

@Injectable({ providedIn: 'root' })
export class SuperAdminService {
  private _http = inject(HttpClient);

  listarContenedores() {
    return this._http.get<ContenedorGlobal[]>(
      `${environment.url_api}/contenedor/contenedor/admin-lista/`
    );
  }
}
