import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import {
  Contenedor,
  ContenedorDetalle,
  ContenedorLista,
} from '../../interfaces/contenedor.interface';
import { ContenedorActionInit } from '../../../../redux/actions/contenedor/contenedor.actions';
import { obtenerUsuarioId } from '../../../../redux/selectors/usuario.selector';
import { ContenedorService } from '../../services/contenedor.service';
import { ContenedorEliminarComponent } from '../contenedor-eliminar/contenedor-eliminar.component';
import { ContenedorInvitarComponent } from '../contenedor-invitar/contenedor-invitar.component';
import { ModalStandardComponent } from '../../../../common/components/ui/modals/modal-standard/modal-standard.component';
import { ModalService } from '../../../../common/components/ui/modals/service/modal.service';
import { EmpresaService } from '../../../empresa/servicios/empresa.service';
import {
  empresaActionInit,
  empresaLimpiarAction,
} from '../../../../redux/actions/empresa/empresa.actions';
import {
  configuracionActionInit,
  configuracionLimpiarAction,
} from '../../../../redux/actions/configuracion/configuracion.actions';
import { GeneralApiService } from '../../../../core/api/general-api.service';
import { FormsModule } from '@angular/forms';
import { PaginadorComponent } from "../../../../common/components/ui/paginacion/paginador/paginador.component";
import { obtenerUsuario } from '../../../../redux/selectors/usuario.selector';

@Component({
  selector: 'app-contenedor-lista',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    RouterLink,
    ModalDefaultComponent,
    ContenedorEliminarComponent,
    ContenedorInvitarComponent,
    ModalStandardComponent,
    FormsModule,
    PaginadorComponent
],
  templateUrl: './contenedor-lista.component.html',
  styleUrl: './contenedor-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContenedorListaComponent
  extends General
  implements OnInit
{
  private contenedorService = inject(ContenedorService);
  private _modalService = inject(ModalService);
  private _empresaService = inject(EmpresaService);
  private _generalApiService = inject(GeneralApiService);
  private destroy$ = new Subject<void>();
  arrConectando: boolean[] = [];
  arrContenedores: ContenedorLista[] = [];
  contenedor: ContenedorLista;
  dominioApp = environment.dominioApp;
  public toggleModal$ = new BehaviorSubject(false);
  public digitalOceanUrl = environment.digitalOceanUrl;

  private searchTerms = new Subject<string>();

  public currentPage = signal<number>(1);
  public searchTerm: string = '';
  public esAdmin = false;

  ngOnInit() {
    this.store
      .select(obtenerUsuario)
      .pipe(takeUntil(this.destroy$))
      .subscribe((usuario) => {
        this.esAdmin = usuario.is_staff;
        this.changeDetectorRef.detectChanges();
      });
    this.consultarLista();
    this.initSearchContenedor();
    this.limpiarEmpresa();
  }

  initSearchContenedor() {
    this.searchTerms
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.searchTerm = term;
        this.consultarLista();
      });
  }

  consultarLista() {
    this.store
      .select(obtenerUsuarioId)
      .pipe(
        switchMap((respuestaUsuarioId: string) => {
          const params: Record<string, any> = {
            usuario_id: respuestaUsuarioId,
            page: this.currentPage(),
          };

          // Agregar el parámetro de búsqueda solo si hay un término
          if (this.searchTerm) {
            params['contenedor__nombre'] = this.searchTerm;
          }

          return this.contenedorService.lista(params);
        }),
        tap((respuestaLista) => {
          respuestaLista.results.forEach(() => this.arrConectando.push(false));
          this.arrContenedores = respuestaLista.results;
          this.changeDetectorRef.detectChanges();
        }),
        catchError((err) => {
          // El backend a veces responde { codigo, mensaje } y otras veces un
          // error HTTP plano (timeout, CORS, 500 sin body). No asumir forma.
          const body = err?.error ?? {};
          const codigo = body.codigo ?? err?.status ?? '—';
          const mensaje = body.mensaje ?? err?.message ?? 'Error inesperado';
          this.alerta.mensajeError(
            'Error consulta',
            `Código: ${codigo} <br/> Mensaje: ${mensaje}`,
          );
          console.error(err);
          return of(null);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  seleccionarEmpresa(
    contenedor_id: number,
    indexContenedor: number,
    rol: string = '',
    perfil_web: string | null = null,
    perfil_movil: string | null = null
  ) {
    this.arrConectando[indexContenedor] = true;
    this.contenedorService
      .detalle(contenedor_id)
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
            rol: rol,
            perfil_web: perfil_web as any,
            perfil_movil: perfil_movil as any,
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
            configuracion: this._generalApiService.getConfiguracion(1).pipe(
              catchError(() => of({
                id: 0,
                empresa: 0,
                informacion_factura: null,
                informacion_factura_superior: null,
                rut_sincronizar_complemento: false,
                rut_rutear_franja: false,
                rut_direccion_origen: '',
                rut_longitud: '',
                rut_latitud: '',
                rut_decodificar_direcciones: true,
                rut_hora_inicio: '07:00',
                rut_whatsapp_habilitado: false,
                rut_whatsapp_plantilla_despacho: null,
                rut_whatsapp_plantilla_idioma: 'es',
                rut_estrategia_ruteo: 'balanceado',
                rut_cita_tipo_defecto: 'obligatoria',
                rut_alerta_parada_activa: false,
                rut_alerta_parada_minutos: 15,
                rut_alerta_parada_radio_metros: 80,
                rut_alerta_geocerca_activa: false,
                rut_limite_complemento: 1000,
                rut_limite_importacion: 500,
                rut_alertas_intervalo_segundos: 30,
              }))
            )
          }).pipe(
            tap(({ empresa, configuracion }) => {
              this.store.dispatch(empresaActionInit({ empresa }));
              this.store.dispatch(configuracionActionInit({ configuracion }));
            })
          );
        }),
        catchError(() => {
          this.arrConectando[indexContenedor] = false;
          return of(null);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.arrConectando[indexContenedor] = false;
        this.router.navigateByUrl('/dashboard');
      });
  }

  /**
   * Mismo criterio que el badge del avatar: prioriza propietario, luego
   * perfil_web (supervisor/operativo/consulta) y al final rol crudo. Asi
   * la lista y el header muestran el mismo lenguaje al usuario.
   */
  getRolEtiqueta(c: ContenedorLista): { texto: string; clase: string } {
    if (c.rol === 'propietario') {
      return { texto: 'Admin', clase: 'badge-success' };
    }
    switch ((c.perfil_web || '').toLowerCase()) {
      case 'supervisor':
        return { texto: 'Supervisor', clase: 'badge-warning' };
      case 'operativo':
        return { texto: 'Operativo', clase: 'badge-info' };
      case 'consulta':
        return { texto: 'Consulta', clase: 'badge-light' };
    }
    if (c.rol === 'control') {
      return { texto: 'Control', clase: 'badge-primary' };
    }
    return { texto: c.rol || 'Usuario', clase: 'badge-info' };
  }

  eliminarContenedor() {
    this.currentPage.set(1);
    this.consultarLista();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  abrirModal() {
    this.toggleModal$.next(true);
  }

  cerrarModal() {
    this.toggleModal$.next(false);
  }

  seleccionarContenedorParaEliminar(contenedor: ContenedorLista) {
    this.contenedor = contenedor;
    this.changeDetectorRef.detectChanges();
  }

  handleEliminarClick(contenedor: ContenedorLista) {
    this.contenedor = contenedor;
    this.openModal('eliminarContenedor');
  }

  // new modal implementation
  openModal(id: string) {
    this._modalService.open(id);
  }

  closeModal(id: string) {
    this._modalService.close(id);
  }

  getModalInstaceState(id: string): Observable<boolean> {
    return this._modalService.isOpen$(id);
  }

  limpiarEmpresa() {
    this.store.dispatch(empresaLimpiarAction());
    this.store.dispatch(configuracionLimpiarAction());
    this.changeDetectorRef.detectChanges();
  }

  cambiarPaginacion(page: number) {
    this.currentPage.set(page);
    this.consultarLista();
  }

  onSearchChange(term: string) {
    this.currentPage.set(1);
    this.searchTerms.next(term);
  }

  get totalItems(): number {
    return this.contenedorService.totalItems || 0;
  }
}
