import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import {
  Contenedor,
  ContenedorDetalle,
  ListaContenedoresRespuesta,
} from '../../interfaces/contenedor.interface';
import { ContenedorActionInit } from '../../../../redux/actions/contenedor/contenedor.actions';
import { obtenerUsuarioId } from '../../../../redux/selectors/usuario.selector';
import { ContenedorService } from '../../services/contenedor.service';
import { ContenedorEliminarComponent } from '../contenedor-eliminar/contenedor-eliminar.component';
import { ContenedorInvitarComponent } from "../contenedor-invitar/contenedor-invitar.component";
import { ModalStandardComponent } from "../../../../common/components/ui/modals/modal-standard/modal-standard.component";
import { ModalService } from '../../../../common/components/ui/modals/service/modal.service';

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
    ModalStandardComponent
],
  templateUrl: './contenedor-lista.component.html',
  styleUrl: './contenedor-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContenedorListaComponent extends General implements OnInit {
  // @ViewChild("contentTemplate") contentTemplate: TemplateRef<any>;
  private contenedorService = inject(ContenedorService);
  private _modalService = inject(ModalService);
  // private menuService = inject(NbMenuService);
  // private windowService = inject(NbWindowService);
  private destroy$ = new Subject<void>();
  // windowRef: NbWindowRef | null;
  arrConectando: boolean[] = [];
  arrContenedores: any[] = [];
  contenedor: Contenedor;
  dominioApp = environment.dominioApp;
  public toggleModal$ = new BehaviorSubject(false);


  ngOnInit() {
    this.consultarLista();
    // this.menu();
    // this.limpiarContenedores();
  }

  // limpiarContenedores() {
  //   this.store.dispatch(ContenedorActionBorrarInformacion());
  //   this.changeDetectorRef.detectChanges();
  // }

  consultarLista() {
    this.store
      .select(obtenerUsuarioId)
      .pipe(
        switchMap((respuestaUsuarioId: string) =>
          this.contenedorService.lista(respuestaUsuarioId)
        ),
        tap((respuestaLista: ListaContenedoresRespuesta) => {
          respuestaLista.contenedores.forEach(() =>
            this.arrConectando.push(false)
          );
          this.arrContenedores = respuestaLista.contenedores;
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

  seleccionarEmpresa(contenedor_id: string, indexContenedor: number) {
    this.arrConectando[indexContenedor] = true;
    this.contenedorService
      .detalle(contenedor_id)
      .pipe(
        catchError(() => {
          this.arrConectando[indexContenedor] = false;
          return of(null);
        })
      )
      .subscribe((respuesta: ContenedorDetalle) => {
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
        this.arrConectando[indexContenedor] = false;
        this.router.navigateByUrl('/dashboard');
      });
  }

  eliminarContenedor() {
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

  seleccionarContenedorParaEliminar(contenedor: Contenedor) {
    this.contenedor = contenedor;
    this.changeDetectorRef.detectChanges();
  }

  handleEliminarClick(contenedor: Contenedor) {
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
}
