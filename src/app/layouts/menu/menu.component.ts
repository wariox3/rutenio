import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItems } from '../../interfaces/general/header/menu.interface';
import { AuthService } from '../../modules/auth/services/auth.service';

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

  cerrarSesion() {
    this._authService.logout();
  }
}
