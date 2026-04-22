import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { removeCookie } from 'typescript-cookie';

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-nav.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNavComponent {
  private router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);

  abierto = false;

  enlaces = [
    { ruta: '/admin/entregas', etiqueta: 'Entregas', icono: 'ki-filled ki-chart-line' },
    { ruta: '/admin/whatsapp', etiqueta: 'WhatsApp', icono: 'ki-filled ki-messages' },
  ];

  constructor() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    ).subscribe(() => {
      if (this.abierto) {
        this.abierto = false;
        this._cdr.markForCheck();
      }
    });
  }

  toggle() {
    this.abierto = !this.abierto;
    this._cdr.markForCheck();
  }

  cerrar() {
    this.abierto = false;
    this._cdr.markForCheck();
  }

  cerrarSesion() {
    removeCookie('admin_token', { path: '/' });
    this.router.navigate(['/admin/login']);
  }
}
