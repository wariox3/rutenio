import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { InputEmailComponent } from '../../../../common/components/ui/form/input-email/input-email.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { Contenedor, ContenedorLista } from '../../interfaces/contenedor.interface';
import { ContenedorInvitacionLista, Usuario } from '../../interfaces/usuarios-contenedores.interface';
import { ContenedorService } from '../../services/contenedor.service';
import { map, Observable, switchMap, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { General } from '../../../../common/clases/general';
import { obtenerUsuarioId } from '../../../../redux/selectors/usuario.selector';
import { ButtonComponent } from "../../../../common/components/ui/button/button.component";

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
  private _formBuilder = inject(FormBuilder);

  formularioInvitacionUsuario = this._formBuilder.group({
    nombre: ['', [Validators.email, Validators.required]],
  });
  listaUsuarios$: Observable<ContenedorInvitacionLista[]>;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this._consultarContenedorUsuarios(this.contenedor.contenedor_id);
  }

  private _consultarContenedorUsuarios(contenedorId: number) {
    this.listaUsuarios$ = this._contenedorService
      .listaUsuarios(contenedorId)
      .pipe(map((response) => response.results));
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
}
