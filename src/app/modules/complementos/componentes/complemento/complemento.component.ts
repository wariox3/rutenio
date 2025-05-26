import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { General } from '../../../../common/clases/general';
import { RespuestaComplemento } from '../../../../interfaces/complemento/complemento.interface';
import { ComplementoService } from '../../servicios/complemento.service';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { KTModal } from '../../../../../metronic/core';
import { BehaviorSubject, finalize } from 'rxjs';
@Component({
  selector: 'app-complemento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalDefaultComponent,
    LabelComponent,
    ButtonComponent,
  ],
  templateUrl: './complemento.component.html',
  styleUrl: './complemento.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ComplementoComponent extends General implements OnInit {
  @ViewChild('contentTemplate') contentTemplate: TemplateRef<any>;

  public guardando$: BehaviorSubject<boolean>;
  public cargandoLista$: BehaviorSubject<boolean>;
  formularioDinamico: FormGroup;
  formularios: FormGroup[] = [];
  formControls: any[] = [];
  arrComplementos: RespuestaComplemento[];
  public toggleModal$ = new BehaviorSubject(false);
  mostrarClave: { [key: number]: boolean } = {};

  private complementoService = inject(ComplementoService);

  indexFormularioSeleccionado: number | null = null;

  arrayDatosJson: FormArray<FormGroup> | null = null;

  constructor() {
    super();
    this.guardando$ = new BehaviorSubject(false);
    this.cargandoLista$ = new BehaviorSubject(false);
  }

  ngOnInit(): void {
    this.consultarLista();
  }

  consultarLista() {
    this.cargandoLista$.next(true);
    this.complementoService
      .listarComplementos()
      .pipe(
        finalize(() => {
          this.cargandoLista$.next(false);
        })
      )
      .subscribe((respuesta) => {
        this.arrComplementos = respuesta;
        this.crearFormulario();
        this.changeDetectorRef.detectChanges();
      });
  }

  crearFormulario() {
    this.formularios = [];
    this.mostrarClave = {};
    this.arrComplementos.forEach((complemento) => {
      const formGroup = new FormGroup({
        id: new FormControl(complemento.id),
        nombre: new FormControl(complemento.nombre),
        estructura_json: new FormControl(complemento.estructura_json),
        datos_json: new FormArray([]),
      });
      
      const datosJSON = formGroup.get('datos_json') as FormArray;

    if (Array.isArray(complemento?.datos_json) || complemento?.datos_json === null) {
      complemento.estructura_json?.forEach((estructuraDatos, index) => {
        const campo = complemento?.datos_json?.filter(
          (campoDatos) => campoDatos.nombre === estructuraDatos.nombre
        );
        const valor = campo?.[0]?.valor || '';
        datosJSON.push(
          new FormGroup({
            valor: new FormControl(
              valor,
              Validators.compose([Validators.required])
            ),
            nombre: new FormControl(estructuraDatos.nombre),
          })
        );
          if (this.esCampoClave(estructuraDatos.nombre)) {
          this.mostrarClave[index] = false;
        }
        });
      } else {
        console.error('datos_json debe ser de tipo Array');
      }

      this.formularios.push(formGroup);
    });

    this.changeDetectorRef.detectChanges();
  }

  guardarInformacion(indexFormulario: number | null) {
    if (indexFormulario !== null && this.formularios[indexFormulario].valid) {
      this.guardando$.next(true);
      const formularioSeleccionado = this.formularios[indexFormulario];
      const id = formularioSeleccionado.get('id')?.value;

      this.complementoService
        .actualizarComplemento(id, formularioSeleccionado.value)
        .pipe(finalize(() => this.guardando$.next(false)))
        .subscribe(() => {
          this.consultarLista();
          this.alerta.mensajaExitoso(
            'Se actualizó correctamente el complemento.',
            'Guardado con éxito.'
          );
          this.dismissModal();
          this.changeDetectorRef.detectChanges();
        });
    }
  }

  instalar(complemento: any) {
    this.complementoService.validarComplemento(complemento.id)
      .subscribe({
        next: (respuesta) => {
          if (respuesta.validado === true) {
            this.complementoService.marcarComoInstalado(complemento)
              .subscribe(() => {
                this.consultarLista();
                this.changeDetectorRef.detectChanges();
                this.alerta.mensajaExitoso(
                  'Complemento instalado correctamente',
                  'Instalación exitosa'
                );
              });
          } else {
            this.alerta.mensajeError(
              'El complemento no pasó la validación requerida',
              'Error de validación'
            );
          }
        },
        error: (error) => {
          const mensajeError = error?.error?.mensaje || 'Error al validar el complemento';
          
          this.alerta.mensajeError(
            'Error al validar el complemento',
            mensajeError 
          );
        }
      });
  }

  private _desinstalar(complemento: any) {
    this.complementoService
      .desinstalarComplemento(complemento)
      .subscribe(() => {
        this.consultarLista();
        this.changeDetectorRef.detectChanges();
      });
  }

  confirmacionDesinstalar(complemento: any) {
    this.alerta
      .confirmar({
        titulo: '¿Estas seguro?',
        texto: 'Esta acción desinstala el complemento',
        textoBotonCofirmacion: 'Si, desinstalar',
      })
      .then((respuesta) => {
        if (respuesta.isConfirmed) {
          this._desinstalar(complemento);
        }
      });
  }

abrirModal(index: number) {
  this.toggleModal$.next(true);
  this.indexFormularioSeleccionado = index;
  const formGroup = this.formularios[this.indexFormularioSeleccionado];
  this.arrayDatosJson = (formGroup?.get('datos_json') as FormArray) || null;
  
  if (this.arrayDatosJson) {
    this.arrayDatosJson.controls.forEach((control, i) => {
      const nombreCampo = control.get('nombre')?.value;
      if (this.esCampoClave(nombreCampo)) {
        this.mostrarClave[i] = false;
      }
    });
  }
}

  cerrarModal() {
    this.toggleModal$.next(false);
  }

  dismissModal() {
    const modalEl: HTMLElement = document.querySelector('#complementos-modal');
    const modal = KTModal.getInstance(modalEl);

    modal.toggle();
  }

  esCampoClave(nombreCampo: string): boolean {
  if (!nombreCampo) return false;
  const palabrasClave = ['clave', 'password', 'contraseña', 'secret', 'token', 'api_key', 'key'];
  return palabrasClave.some(palabra => 
    nombreCampo.toLowerCase().includes(palabra.toLowerCase())
  );
}

toggleMostrarClave(index: number) {
  this.mostrarClave[index] = !this.mostrarClave[index];
}

}
