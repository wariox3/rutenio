import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CargarImagenComponent } from '../../../common/components/cargar-imagen/cargar-imagen.component';
import { map, Observable, switchMap, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  obtenerUsuario,
  obtenerUsuarioId,
} from '../../../redux/selectors/usuario.selector';
import { Usuario } from '../../../interfaces/user/user.interface';
import { AuthService } from '../../auth/components/services/auth.service';
import { usuarioActionActualizar } from '../../../redux/actions/auth/usuario.actions';
import { ModalService } from '../../../common/components/ui/modals/service/modal.service';
import { ModalStandardComponent } from "../../../common/components/ui/modals/modal-standard/modal-standard.component";
import { InformacionUsuarioComponent } from "../../auth/components/informacion-usuario/informacion-usuario.component";
import { General } from '../../../common/clases/general';

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
  public usuario$ = this._store.select(obtenerUsuario);

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

  recuperarBase64(base64: string) {
    this.store.dispatch(
      usuarioActionActualizar({
        usuario: {
          imagen: '',
        },
      })
    );
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
