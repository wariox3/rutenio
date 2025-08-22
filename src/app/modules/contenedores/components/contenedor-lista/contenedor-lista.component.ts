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
  Observable,
  of,
  Subject,
  switchMap,
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
import { FormsModule } from '@angular/forms';
import { PaginadorComponent } from "../../../../common/components/ui/paginacion/paginador/paginador.component";

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

  ngOnInit() {
    this.consultarLista();
    this.initSearchContenedor();
    this.limpiarEmpresa();
  }

  initSearchContenedor() {
    this.searchTerms
      .pipe(debounceTime(500), distinctUntilChanged())
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
        catchError(({ error }) => {
          this.alerta.mensajeError(
            'Error consulta',
            `Código: ${error.codigo} <br/> Mensaje: ${error.mensaje}`
          );
          console.error(error);
          return of(null);
        })
      )
      .subscribe();
  }

  seleccionarEmpresa(contenedor_id: number, indexContenedor: number) {
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
            rol: '',
            plan_id: respuesta.plan_id,
            plan_nombre: respuesta.plan_nombre,
            usuarios: respuesta.plan_limite_usuarios,
            usuarios_base: respuesta.plan_usuarios_base,
            reddoc: respuesta.reddoc,
            ruteo: respuesta.ruteo,
            acceso_restringido: respuesta.acceso_restringido,
          };
          this.store.dispatch(ContenedorActionInit({ contenedor }));
          this._empresaService.detalle().subscribe((empresa: any) => {
            this.store.dispatch(empresaActionInit({ empresa }));
          });
          return of(null);
        }),
        catchError(() => {
          this.arrConectando[indexContenedor] = false;
          return of(null);
        })
      )
      .subscribe(() => {
        this.arrConectando[indexContenedor] = false;
        this.router.navigateByUrl('/dashboard');
      });
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
