import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { RouterLink } from '@angular/router';

interface ContenedorAdmin {
  id: number;
  schema_name: string;
  nombre: string;
  acceso_whatsapp: boolean;
  fecha: string;
  usuarios: number;
}

@Component({
  selector: 'app-contenedor-admin-whatsapp',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contenedor-admin-whatsapp.component.html',
})
export default class ContenedorAdminWhatsappComponent implements OnInit {
  private http = inject(HttpClient);
  contenedores: ContenedorAdmin[] = [];
  cargando = true;
  procesandoId: number | null = null;

  ngOnInit(): void {
    this.consultarContenedores();
  }

  consultarContenedores() {
    this.cargando = true;
    this.http
      .get<ContenedorAdmin[]>(
        `${environment.url_api}/contenedor/contenedor/admin-lista/`
      )
      .subscribe({
        next: (respuesta) => {
          this.contenedores = respuesta;
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
        },
      });
  }

  toggleWhatsapp(contenedor: ContenedorAdmin) {
    this.procesandoId = contenedor.id;
    this.http
      .post<{ mensaje: string; acceso_whatsapp: boolean }>(
        `${environment.url_api}/contenedor/contenedor/toggle-whatsapp/`,
        { id: contenedor.id }
      )
      .subscribe({
        next: (respuesta) => {
          contenedor.acceso_whatsapp = respuesta.acceso_whatsapp;
          this.procesandoId = null;
        },
        error: () => {
          this.procesandoId = null;
        },
      });
  }
}
