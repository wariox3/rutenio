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
import { InputComponent } from '../../../../common/components/ui/form/input/input.component';
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
    InputComponent,
    ButtonComponent,
  ],
  templateUrl: './complemento.component.html',
  styleUrl: './complemento.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ComplementoComponent extends General implements OnInit {
  @ViewChild('contentTemplate') contentTemplate: TemplateRef<any>;

  public guardando$: BehaviorSubject<boolean>;
  formularioDinamico: FormGroup;
  formularios: FormGroup[] = [];
  formControls: any[] = [];
  arrComplementos: RespuestaComplemento[];

  private complementoService = inject(ComplementoService);

  indexFormularioSeleccionado: number | null = null;

  arrayDatosJson: FormArray<FormGroup> | null = null;

  ngOnInit(): void {
    this.consultarLista();
    this.guardando$ = new BehaviorSubject(false);
  }

  consultarLista() {
    this.complementoService.listarComplementos().subscribe((respuesta) => {
      this.arrComplementos = respuesta;
      this.crearFormulario();
      this.changeDetectorRef.detectChanges();
    });
  }

  crearFormulario() {
    this.arrComplementos.forEach((complemento) => {
      const formGroup = new FormGroup({
        id: new FormControl(complemento.id),
        nombre: new FormControl(complemento.nombre),
        estructura_json: new FormControl(complemento.estructura_json),
        datos_json: new FormArray([]),
      });

      const datosJSON = formGroup.get('datos_json') as FormArray;

      if (
        Array.isArray(complemento?.datos_json) ||
        complemento?.datos_json === null
      ) {
        complemento.estructura_json?.forEach((estructuraDatos) => {
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
          this.cerrarModal();
          this.changeDetectorRef.detectChanges();
        });
    }
  }

  instalar(complemento: any) {
    const complementoModificado = { ...complemento, instalado: true };
    this.complementoService
      .instalarComplemento(complementoModificado.id, complementoModificado)
      .subscribe((respuesta) => {
        this.consultarLista();
        this.changeDetectorRef.detectChanges();
      });
  }

  abrirModal(index: number) {
    this.indexFormularioSeleccionado = index;
    const formGroup = this.formularios[this.indexFormularioSeleccionado];
    this.arrayDatosJson = (formGroup?.get('datos_json') as FormArray) || null;
  }

  cerrarModal() {
    const modalEl: HTMLElement = document.querySelector('#complementos-modal');
    const modal = KTModal.getInstance(modalEl);

    modal.hide();
  }
}
