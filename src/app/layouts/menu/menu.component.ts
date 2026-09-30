import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItems } from '../../interfaces/general/header/menu.interface';
import { AuthService } from '../../modules/auth/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  @Input({ required: true }) nombre: string;
  @Input() apellido: string = '';
  @Input() nombreCorto: string = '';
  @Input() username: string = '';
  @Input() correo: string = '';
  @Input() contenedorNombre: string;
  @Input() rolContenedor: string = '';
  @Input() perfilWeb: string = '';
  @Input() esSuperAdmin: boolean = false;
  @Input() puedeAdmin: boolean = false;
  @Input({ required: true }) menuItems: MenuItems[];
  @Input() imagen: string;

  private _authService = inject(AuthService);
  public url_reddoc_cuenta = environment.url_reddoc_cuenta;

  /** Fallback nombre -> nombreCorto -> correo -> username: hay cuentas legacy sin `nombre`. */
  get nombreVisible(): string {
    const nombreCompleto = [this.nombre, this.apellido]
      .filter((s) => !!s && s.trim().length > 0)
      .join(' ')
      .trim();
    if (nombreCompleto) return nombreCompleto;
    if (this.nombreCorto?.trim()) return this.nombreCorto.trim();
    if (this.correo?.includes('@')) return this.correo.split('@')[0];
    return this.username || 'Usuario';
  }

  get rolEtiqueta(): { texto: string; clase: string } | null {
    if (this.esSuperAdmin) {
      return { texto: 'Super admin', clase: 'badge-primary' };
    }
    if (this.rolContenedor === 'propietario') {
      return { texto: 'Admin', clase: 'badge-success' };
    }
    switch ((this.perfilWeb || '').toLowerCase()) {
      case 'supervisor':
        return { texto: 'Supervisor', clase: 'badge-warning' };
      case 'operativo':
        return { texto: 'Operativo', clase: 'badge-info' };
      case 'consulta':
        return { texto: 'Consulta', clase: 'badge-light' };
    }
    if (this.rolContenedor === 'usuario' || this.rolContenedor === 'invitado') {
      return { texto: 'Usuario', clase: 'badge-info' };
    }
    return null;
  }

  cerrarSesion() {
    this._authService.logout();
  }
}
