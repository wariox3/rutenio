import { CommonModule, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable, switchMap, tap } from 'rxjs';
import { General } from '../../../common/clases/general';
import { CargarImagenComponent } from '../../../common/components/cargar-imagen/cargar-imagen.component';
import { ModalStandardComponent } from "../../../common/components/ui/modals/modal-standard/modal-standard.component";
import { ModalService } from '../../../common/components/ui/modals/service/modal.service';
import { usuarioActionActualizar } from '../../../redux/actions/auth/usuario.actions';
import {
  obtenerUsuario,
  obtenerUsuarioId,
} from '../../../redux/selectors/usuario.selector';
import { InformacionUsuarioComponent } from "../../auth/components/informacion-usuario/informacion-usuario.component";
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, CargarImagenComponent, ModalStandardComponent, InformacionUsuarioComponent],
  templateUrl: './perfil.component.html',
})
export default class PerfilComponent extends General {
  private _store = inject(Store);
  private _authService = inject(AuthService);
  private _modalService = inject(ModalService);
  private _location = inject(Location);
  public usuario$ = this._store.select(obtenerUsuario);

  constructor() {
    super();
  }

  goBack(): void {
    this._location.back();
  }

  ngOnInit(): void {
  }

  getUserImageUrl() {
    return this.usuario$?.pipe(map((usuario) => {
      if(usuario?.imagen.includes('defecto')){
        return usuario?.imagen;
      } else {
        return `${usuario?.imagen}?${new Date().getTime()}`;
      }
    }));
  }

  recuperarBase64(base64: string) {
    this._store
      .select(obtenerUsuarioId)
      .pipe(
        switchMap((usuarioId) =>
          this._authService.cargarImagen(usuarioId, base64)
        ),
        tap((respuestaCargarImagen) => {
          if (respuestaCargarImagen.cargar) {
            this._store.dispatch(
              usuarioActionActualizar({
                usuario: {
                  imagen: respuestaCargarImagen.imagen,
                },
              })
            );
            this.alerta.mensajaExitoso(
              'Información actualizada correctamente'
            );
          }
        })
      )
      .subscribe();
  }

  eliminarImagen(event: boolean) {
    this._store
      .select(obtenerUsuarioId)
      .pipe(
        switchMap((codigoUsuario) =>
          this._authService.eliminarImagen(codigoUsuario)
        ),
        tap((respuestaEliminarImagen) => {
          if (respuestaEliminarImagen.limpiar) {
            this._store.dispatch(
              usuarioActionActualizar({
                usuario: {
                  imagen: respuestaEliminarImagen.imagen,
                },
              })
            );
            this.alerta.mensajaExitoso(
              'Información actualizada correctamente'
            );
          }
        })
      )
      .subscribe();
  }

  openModal(id: string) {
    this._modalService.open(id);
  }

  getModalInstaceState(id: string): Observable<boolean> {
    return this._modalService.isOpen$(id);
  }
}
