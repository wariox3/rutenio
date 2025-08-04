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
  @Input() contenedorNombre: string;
  @Input({ required: true }) menuItems: MenuItems[];
  @Input() imagen: string;

  private _authService = inject(AuthService);
  public url_reddoc_cuenta = environment.url_reddoc_cuenta;

  cerrarSesion() {
    this._authService.logout();
  }
}
