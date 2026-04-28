import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, forkJoin, of, switchMap, tap } from 'rxjs';
import { ContenedorActionInit } from '../../redux/actions/contenedor/contenedor.actions';
import {
  obtenerContenedorId,
  obtenerContenedorNombre,
} from '../../redux/selectors/contenedor.selector';
import { obtenerUsuarioId } from '../../redux/selectors/usuario.selector';
import { General } from '../../common/clases/general';
import { ContenedorService } from '../../modules/contenedores/services/contenedor.service';
import { EmpresaService } from '../../modules/empresa/servicios/empresa.service';
import { GeneralApiService } from '../../core';
import {
  Contenedor,
  ContenedorDetalle,
  ContenedorLista,
} from '../../modules/contenedores/interfaces/contenedor.interface';
import {
  empresaActualizacionAction,
  empresaLimpiarAction,
} from '../../redux/actions/empresa/empresa.actions';
import { configuracionActualizacionAction } from '../../redux/actions/configuracion/configuracion.actions';

@Component({
  selector: 'app-selector-contenedor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selector-contenedor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectorContenedorComponent extends General implements OnInit {
  private _contenedorService = inject(ContenedorService);
  private _empresaService = inject(EmpresaService);
  private _generalApiService = inject(GeneralApiService);
  private _router = inject(Router);

  public contenedorActivoId$ = this.store.select(obtenerContenedorId);
  public contenedorActivoNombre$ = this.store.select(obtenerContenedorNombre);
  public contenedores = signal<ContenedorLista[]>([]);
  public abierto = signal<boolean>(false);
  public cargandoCambio = signal<boolean>(false);

  ngOnInit(): void {
    this._cargar();
  }

  private _cargar() {
    this.store
      .select(obtenerUsuarioId)
      .subscribe((usuarioId: string) => {
        if (!usuarioId) return;
        this._contenedorService
          .lista({ usuario_id: usuarioId, page: 1 })
          .subscribe({
            next: (resp: any) => {
              this.contenedores.set(resp?.results || []);
              this.changeDetectorRef.detectChanges();
            },
          });
      });
  }

  toggle() {
    this.abierto.update((v) => !v);
  }

  cerrar() {
    this.abierto.set(false);
  }

  cambiar(item: ContenedorLista) {
    if (this.cargandoCambio()) return;
    this.cargandoCambio.set(true);
    this.cerrar();
    this._contenedorService
      .detalle(item.contenedor_id)
      .pipe(
        switchMap((respuesta: ContenedorDetalle) => {
          const contenedor: Contenedor = {
            nombre: respuesta.nombre,
            imagen: respuesta.imagen,
            contenedor_id: respuesta.id,
            subdominio: respuesta.subdominio,
            id: respuesta.id,
            usuario_id: respuesta.usuario_id,
            seleccion: true,
            rol: item.rol,
            plan_id: respuesta.plan_id,
            plan_nombre: respuesta.plan_nombre,
            usuarios: respuesta.plan_limite_usuarios,
            usuarios_base: respuesta.plan_usuarios_base,
            reddoc: respuesta.reddoc,
            ruteo: respuesta.ruteo,
            acceso_restringido: respuesta.acceso_restringido,
          };
          this.store.dispatch(ContenedorActionInit({ contenedor }));
          return forkJoin({
            empresa: this._empresaService.detalle(),
            configuracion: this._generalApiService
              .getConfiguracion(1)
              .pipe(catchError(() => of(null))),
          });
        }),
        tap(({ empresa, configuracion }: any) => {
          if (empresa) {
            this.store.dispatch(empresaLimpiarAction());
            this.store.dispatch(
              empresaActualizacionAction({ empresa })
            );
          }
          if (configuracion) {
            this.store.dispatch(
              configuracionActualizacionAction({ configuracion })
            );
          }
        })
      )
      .subscribe({
        next: () => {
          this.cargandoCambio.set(false);
          this._router.navigate(['/dashboard']);
        },
        error: () => {
          this.cargandoCambio.set(false);
          this.alerta.mensajeError(
            'Error',
            'No se pudo cambiar de contenedor'
          );
        },
      });
  }

  rolEtiqueta(rol: string): { texto: string; clase: string } {
    if (rol === 'propietario') {
      return { texto: 'Admin', clase: 'badge-success' };
    }
    return { texto: 'Usuario', clase: 'badge-info' };
  }

  esActivo(item: ContenedorLista, activoId: string | null): boolean {
    return String(item.contenedor_id) === activoId;
  }
}
