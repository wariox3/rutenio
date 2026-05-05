import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable, switchMap, take, tap } from 'rxjs';
import { General } from '../../../common/clases/general';
import { CargarImagenComponent } from '../../../common/components/cargar-imagen/cargar-imagen.component';
import { ModalStandardComponent } from "../../../common/components/ui/modals/modal-standard/modal-standard.component";
import { ModalService } from '../../../common/components/ui/modals/service/modal.service';
import { usuarioActionActualizar } from '../../../redux/actions/auth/usuario.actions';
import {
  obtenerUsuario,
  obtenerUsuarioId,
} from '../../../redux/selectors/usuario.selector';
import {
  obtenerContenedorId,
  obtenerContenedorNombre,
  obtenerContenedorRol,
  obtenerEsAdminContenedor,
} from '../../../redux/selectors/contenedor.selector';
import { InformacionUsuarioComponent } from "../../auth/components/informacion-usuario/informacion-usuario.component";
import { AuthService } from '../../auth/services/auth.service';
import { ContenedorService } from '../../contenedores/services/contenedor.service';
import { ContenedorLista } from '../../contenedores/interfaces/contenedor.interface';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, CargarImagenComponent, ModalStandardComponent, InformacionUsuarioComponent],
  templateUrl: './perfil.component.html',
})
export default class PerfilComponent extends General implements OnInit {
  private _store = inject(Store);
  private _authService = inject(AuthService);
  private _modalService = inject(ModalService);
  private _location = inject(Location);
  private _contenedorService = inject(ContenedorService);
  public usuario$ = this._store.select(obtenerUsuario);
  public esAdminContenedor$ = this._store.select(obtenerEsAdminContenedor);
  public rolContenedor$ = this._store.select(obtenerContenedorRol);
  public contenedorNombre$ = this._store.select(obtenerContenedorNombre);
  public contenedorActivoId$ = this._store.select(obtenerContenedorId);
  public membresias = signal<ContenedorLista[]>([]);
  public cargandoMembresias = signal<boolean>(true);

  constructor() {
    super();
  }

  goBack(): void {
    this._location.back();
  }

  ngOnInit(): void {
    this._cargarMembresias();
  }

  private _cargarMembresias() {
    this._store
      .select(obtenerUsuarioId)
      .pipe(take(1))
      .subscribe((usuarioId) => {
        if (!usuarioId) {
          this.cargandoMembresias.set(false);
          return;
        }
        this._contenedorService
          .lista({ usuario_id: usuarioId, page: 1 })
          .subscribe({
            next: (resp: any) => {
              this.membresias.set(resp?.results || []);
              this.cargandoMembresias.set(false);
            },
            error: () => this.cargandoMembresias.set(false),
          });
      });
  }

  rolEtiqueta(rol: string): { texto: string; clase: string } {
    if (rol === 'propietario') return { texto: 'Admin', clase: 'badge-success' };
    return { texto: 'Usuario', clase: 'badge-light' };
  }

  esActivo(item: ContenedorLista, activoId: string | null): boolean {
    return String(item.contenedor_id) === activoId;
  }

  getUserImageUrl() {
    return this.usuario$?.pipe(map((usuario) => {
      if(usuario?.imagen_thumbnail.includes('defecto')){
        return usuario?.imagen_thumbnail;
      } else {
        return `${usuario?.imagen_thumbnail}?${new Date().getTime()}`;
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
