import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { removeCookie } from 'typescript-cookie';

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-nav.component.html',
})
export class AdminNavComponent {
  private router = inject(Router);

  enlaces = [
    { ruta: '/admin/entregas', etiqueta: 'Entregas', icono: 'ki-filled ki-chart-line' },
    { ruta: '/admin/whatsapp', etiqueta: 'WhatsApp', icono: 'ki-filled ki-messages' },
  ];

  cerrarSesion() {
    removeCookie('admin_token', { path: '/' });
    this.router.navigate(['/admin/login']);
  }
}
