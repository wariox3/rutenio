import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  signal
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { debounceTime, distinctUntilChanged, map, Subject, switchMap, tap } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from "../../../../common/components/ui/button/button.component";
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { AlertaService } from '../../../../common/services/alerta.service';
import { GeneralService } from '../../../../common/services/general.service';
import { obtenerUsuarioId } from '../../../../redux/selectors/usuario.selector';
import { ContenedorLista } from '../../interfaces/contenedor.interface';
import { ContenedorInvitacionLista } from '../../interfaces/usuarios-contenedores.interface';
import { ContenedorService } from '../../services/contenedor.service';

@Component({
  selector: 'app-contenedor-invitar',
  standalone: true,
  imports: [
    LabelComponent,
    ReactiveFormsModule,
    ButtonComponent,
    NgSelectModule
  ],
  templateUrl: 'contenedor-invitar.component.html',
  styleUrl: './contenedor-invitar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContenedorInvitarComponent extends General implements OnInit {
  @Input({ required: true }) contenedor: ContenedorLista;

  private _contenedorService = inject(ContenedorService);
  private _alertaService = inject(AlertaService);
  private _formBuilder = inject(FormBuilder);
  private _generalService = inject(GeneralService);

  formularioInvitacionUsuario = this._formBuilder.group({
    id: [null, [Validators.required]],
    contenedoresExtras: [<number[]>[]],
  });
  listaUsuarios = signal<ContenedorInvitacionLista[]>([]);
  listaUsuariosOpciones = signal<any[]>([]);
  contenedoresAdmin = signal<ContenedorLista[]>([]);

  private _busquedaUsuarioSubject$ = new Subject<string>();

  constructor() {
    super();
  }

  ngOnInit(): void {
    this._consultarContenedorUsuarios(this.contenedor.contenedor_id);
    this._buscarUsuarios();
    this._inicializarBusquedaUsuarios();
    this._cargarContenedoresAdmin();
  }

  private _cargarContenedoresAdmin() {
    this._contenedorService
      .lista({ rol: 'propietario' })
      .pipe(
        map((res: any) =>
          (res?.results || []).filter(
            (c: ContenedorLista) =>
              c.contenedor_id !== this.contenedor.contenedor_id &&
              (c.rol === 'propietario' || !c.rol)
          )
        )
      )
      .subscribe((lista) => this.contenedoresAdmin.set(lista));
  }

  private _inicializarBusquedaUsuarios() {
    this._busquedaUsuarioSubject$
      .pipe(
        debounceTime(300), // Espera 300ms después de que el usuario deje de escribir
        distinctUntilChanged(), // Solo emite si el valor cambió
        tap((email) => this._buscarUsuarios(email))
      )
      .subscribe();
  }

  private _consultarContenedorUsuarios(contenedorId: number) {
    this._contenedorService
      .listaUsuarios(contenedorId)
      .pipe(map((response) => {
        this.listaUsuarios.set(response.results)
      })).subscribe();
  }

  private _limpiarFormulario() {
    this.formularioInvitacionUsuario.reset();
  }

  enviarInvitacionUsuario(contenedorId: number) {
    const extras = this.formularioInvitacionUsuario.controls.contenedoresExtras.value || [];
    const ids = [contenedorId, ...extras.filter((id) => id !== contenedorId)];

    this.store
      .select(obtenerUsuarioId)
      .pipe(
        switchMap((usuarioId) =>
          this._contenedorService.invitarUsuario({
            contenedorId: contenedorId,
            usuarioId: usuarioId,
            usuarioInvitadoId: this.formularioInvitacionUsuario.controls.id.value,
            contenedoresIds: ids.length > 1 ? ids : undefined,
          })
        ),
        tap(() => {
          const mensaje = ids.length > 1
            ? `Usuario asignado a ${ids.length} contenedores.`
            : 'Se ha enviado un correo de invitación.';
          this.alerta.mensajaExitoso(mensaje);
          this._limpiarFormulario();
        })
      )
      .subscribe({
        next: () => {
          this._consultarContenedorUsuarios(this.contenedor.contenedor_id);
        }
      });
  }

  cederAdminA(usuario: ContenedorInvitacionLista) {
    this._alertaService
      .confirmar({
        titulo: '¿Ceder administración?',
        texto: `El usuario ${usuario.usuario__username} pasará a ser el administrador del contenedor. Tú quedarás como usuario regular y perderás permisos de admin.`,
        textoBotonCofirmacion: 'Sí, ceder',
        colorConfirmar: '#d33',
      })
      .then(({ isConfirmed }) => {
        if (!isConfirmed) return;
        this._contenedorService
          .cederAdmin(this.contenedor.contenedor_id, usuario.usuario)
          .pipe(
            tap(() => {
              this.alerta.mensajaExitoso('Administración transferida.');
              this._consultarContenedorUsuarios(this.contenedor.contenedor_id);
            })
          )
          .subscribe();
      });
  }

  eliminarInvitado(usuario_id: Number) {
    this._alertaService
      .mensajeValidacion(
        'Eliminar usuario de este contenedor',
        'Este proceso no tiene reversa',
        'warning',
      )
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this._contenedorService
            .eliminarEmpresaUsuario(usuario_id)
            .pipe(
              tap(() => {
                this._consultarContenedorUsuarios(this.contenedor.contenedor_id);
                this._alertaService.mensajaExitoso('Por favor espere, procesando eliminación');
              }),
            )
            .subscribe();
        }
      });
  }

  seleccionarUsuario(usuario: any) {
    if (!usuario) {
      this._buscarUsuarios('');
      return;
    }
  }

  buscarUsuarioPorEmail(event?: any) {
    const excludedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

    if (excludedKeys.includes(event?.key)) {
      return;
    }

    const email = event?.target.value || '';
    this._busquedaUsuarioSubject$.next(email);
  }

  private _buscarUsuarios(email?: string) {
    const arrFiltros = {
      'username__icontains': email,
    };

    this._contenedorService.buscarUsuario({
      ...arrFiltros
    }).subscribe({
      next: (response: any) => {
        this.listaUsuariosOpciones.set(response);
      },
      error: (error) => {
        console.error('Error al buscar usuarios:', error);
      }
    });
  }
}
