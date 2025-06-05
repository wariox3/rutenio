import { CommonModule, NgFor, NgIf } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { General } from '../../../../common/clases/general';
import { InputComponent } from '../../../../common/components/ui/form/input/input.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { ModalService } from '../../../../common/components/ui/modals/service/modal.service';
import {
  usuarioActionActualizar
} from '../../../../redux/actions/auth/usuario.actions';
import {
  obtenerUsuario,
  obtenerUsuarioId,
} from '../../../../redux/selectors/usuario.selector';
import { Usuario } from '../../../contenedores/interfaces/usuarios-contenedores.interface';
import { paises } from '../../constants/paises';
import { LanguageFlag } from '../../types/informacion-perfil.type';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-informacion-usuario',
  templateUrl: './informacion-usuario.component.html',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    NgFor,
    NgIf,
    InputComponent,
    LabelComponent,
  ],
})
export class InformacionUsuarioComponent extends General implements OnInit {
  usuarioInformacion: any = {
    id: 0,
    nombre_corto: '',
    nombre: '',
    apellido: '',
    telefono: '',
    indicativoPais: '',
    idioma: '',
    numero_identificacion: '',
    cargo: '',
  };
  @ViewChild('dialogTemplate') customTemplate!: TemplateRef<any>;
  private _authService = inject(AuthService);
  private _modalService = inject(ModalService);

  paises = paises;
  srcResult: string = '';
  usuario: Usuario;
  codigoUsuario = 0;
  btnGuardar!: ElementRef<HTMLButtonElement>;
  modalRef: any;
  language: LanguageFlag;
  langs = [
    {
      lang: 'es',
      name: 'Español',
    },
  ];

  formularioResumen = new FormGroup({
    nombre: new FormControl(
      '',
      Validators.compose([Validators.maxLength(255)])
    ),
    apellido: new FormControl(
      '',
      Validators.compose([Validators.maxLength(255)])
    ),
    indicativoPais: new FormControl(''),
    telefono: new FormControl(
      '',
      Validators.compose([
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[0-9]+$/),
      ])
    ),
    nombreCorto: new FormControl(
      '',
      Validators.compose([Validators.required, Validators.maxLength(255)])
    ),
    idioma: new FormControl('', Validators.compose([Validators.minLength(2)])),
    cargo: new FormControl('', Validators.compose([Validators.maxLength(255)])),
    numero_identificacion: new FormControl(
      '',
      Validators.compose([Validators.maxLength(20)])
    ),
    imagen: new FormControl(''),
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.initForm();
    this.store.select(obtenerUsuarioId).subscribe((codigoUsuario) => {
      this.codigoUsuario = codigoUsuario;
      this.changeDetectorRef.detectChanges();
    });
    this.store.select(obtenerUsuario).subscribe((usuario) => {
      this.usuario = usuario;
    });
    this.consultarInformacion();
  }

  initForm() {
    this.formularioResumen.patchValue({
      nombre: this.usuarioInformacion.nombre,
      apellido: this.usuarioInformacion.apellido,
      indicativoPais: this.usuarioInformacion.indicativoPais,
      telefono: this.usuarioInformacion.telefono,
      nombreCorto: this.usuarioInformacion.nombre_corto,
      idioma: this.usuarioInformacion.idioma,
      cargo: this.usuarioInformacion.cargo,
      numero_identificacion: this.usuarioInformacion.numero_identificacion,
    });

    this.formularioResumen
      .get('numero_identificacion')
      ?.valueChanges.subscribe((value) => {
        if (value === '') {
          this.formularioResumen.get('numero_identificacion')?.setValue(null);
        }
      });

    this.changeDetectorRef.detectChanges();
  }

  get formFields() {
    return this.formularioResumen.controls;
  }

  formSubmit() {
    if (this.formularioResumen.valid) {
      let indicativoPais = this.formularioResumen.value.indicativoPais;
      let telefono = this.formularioResumen.value.telefono;

      if (indicativoPais && telefono) {
        telefono = `${indicativoPais} ${telefono}`;
      } else if (telefono) {
        telefono = telefono;
      } else if (indicativoPais) {
        telefono = indicativoPais;
      } else {
        telefono = null;
      }

      if (this.usuarioInformacion.id) {
        this._authService
          .actualizarInformacion({
            id: this.usuarioInformacion.id,
            nombre: this.formularioResumen.value.nombre || null,
            apellido: this.formularioResumen.value.apellido || null,
            telefono: telefono,
            nombreCorto: this.formularioResumen.value.nombreCorto,
            idioma: this.formularioResumen.value.idioma,
            imagen: this.formularioResumen.value.imagen,
            cargo: this.formularioResumen.value.cargo,
            numero_identificacion:
              this.formularioResumen.value.numero_identificacion,
          })
          .subscribe({
            next: (respuesta) => {
              this.store.dispatch(
                usuarioActionActualizar({
                  usuario: {
                    nombre_corto: this.formularioResumen.value.nombreCorto,
                    nombre: this.formularioResumen.value.nombre,
                    apellido: this.formularioResumen.value.apellido,
                    telefono: telefono,
                    idioma: this.formularioResumen.value.idioma,
                    cargo: this.formularioResumen.value.cargo,
                    numero_identificacion:
                      this.formularioResumen.value.numero_identificacion,
                  },
                })
              );
              this.alerta.mensajaExitoso(
                'Información actualizada correctamente'
              );
            },
          });
        this._modalService.close('editar-perfil');
      }
    } else {
      this.formularioResumen.markAllAsTouched();
    }
  }

  consultarInformacion() {
    this._authService.perfil(this.codigoUsuario).subscribe({
      next: (respuesta) => {
        let indicativo = '';
        let telefono = '';

        if (respuesta.telefono) {
          if (respuesta.telefono.charAt(0) === '+') {
            let partesTelefono = respuesta.telefono.split(' ');
            indicativo = partesTelefono[0];
            telefono = partesTelefono[1];
          } else {
            telefono = respuesta.telefono;
          }
        }
        this.usuarioInformacion = {
          id: respuesta.id,
          nombre: respuesta.nombre,
          apellido: respuesta.apellido,
          telefono: telefono,
          nombre_corto: respuesta.nombre_corto,
          indicativoPais: indicativo,
          idioma: respuesta.idioma,
          cargo: respuesta.cargo,
          numero_identificacion: respuesta.numero_identificacion,
        };

        this.changeDetectorRef.detectChanges();
        this.initForm();
      },
    });
  }
}
