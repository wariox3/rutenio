import { AsyncPipe } from '@angular/common';
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
import { map, switchMap, tap } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from "../../../../common/components/ui/button/button.component";
import { InputEmailComponent } from '../../../../common/components/ui/form/input-email/input-email.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { AlertaService } from '../../../../common/services/alerta.service';
import { obtenerUsuarioId } from '../../../../redux/selectors/usuario.selector';
import { ContenedorLista } from '../../interfaces/contenedor.interface';
import { ContenedorInvitacionLista } from '../../interfaces/usuarios-contenedores.interface';
import { ContenedorService } from '../../services/contenedor.service';

@Component({
  selector: 'app-contenedor-invitar',
  standalone: true,
  imports: [
    InputEmailComponent,
    LabelComponent,
    AsyncPipe,
    ReactiveFormsModule,
    ButtonComponent
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

  formularioInvitacionUsuario = this._formBuilder.group({
    nombre: ['', [Validators.email, Validators.required]],
  });
  listaUsuarios = signal<ContenedorInvitacionLista[]>([]);

  constructor() {
    super();
  }

  ngOnInit(): void {
    this._consultarContenedorUsuarios(this.contenedor.contenedor_id);
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
    this.store
      .select(obtenerUsuarioId)
      .pipe(
        switchMap((usuarioId) =>
          this._contenedorService.invitarUsuario({
            accion: 'invitar',
            aplicacion: 'ruteo',
            contenedor_id: contenedorId,
            usuario_id: usuarioId,
            invitado: this.formularioInvitacionUsuario.controls.nombre.value,
          })
        ),
        tap(() => {
          this.alerta.mensajaExitoso('Se ha enviado un correo de invitación.');
          this._limpiarFormulario();
        })
      )
      .subscribe();
  }

  eliminarInvitado(usuario_id: Number) {
    this._alertaService
      .mensajeValidacion(
        'Eliminar usuario de esta contenedor',
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
}
