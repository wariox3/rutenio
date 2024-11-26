import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { General } from '../../../../common/clases/general';
import { InputComponent } from '../../../../common/components/ui/form/input/input.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { SwitchComponent } from '../../../../common/components/ui/form/switch/switch.component';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { BehaviorSubject, finalize } from 'rxjs';
import { VisitaService } from '../../servicios/visita.service';
import { SoloNumerosDirective } from '../../../../common/directivas/solo-numeros.directive';

@Component({
  selector: 'app-visita-importar-por-complemento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    LabelComponent,
    SwitchComponent,
    ButtonComponent,
  ],
  templateUrl: './visita-importar-por-complemento.component.html',
  styleUrl: './visita-importar-por-complemento.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaImportarPorComplementoComponent extends General {
  @Output() emitirConsultarLista: EventEmitter<void>;
  @Output() emitirCerrarModal: EventEmitter<void>;

  public estaImportandoComplementos$: BehaviorSubject<boolean>;
  private _visitaService = inject(VisitaService);
  public numeroDeRegistrosAImportar: number = 1;
  public formularioComplementos = new FormGroup(
    {
      numeroRegistros: new FormControl(
        100,
        Validators.compose([Validators.required])
      ),
      desde: new FormControl(''),
      hasta: new FormControl(''),
      pendienteDespacho: new FormControl(true),
    },
    { validators: this.validarRango() }
  );

  constructor() {
    super();
    this.emitirConsultarLista = new EventEmitter();
    this.emitirCerrarModal = new EventEmitter();
    this.estaImportandoComplementos$ = new BehaviorSubject(false);
  }

  validarRango(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const desde = formGroup.get('desde')?.value;
      const hasta = formGroup.get('hasta')?.value;

      // Si "hasta" es menor que "desde", retorna el error
      return hasta < desde ? { rangoInvalido: true } : null;
    };
  }

  transformarAPositivoMayorCero(numero: number) {
    return numero > 0 ? numero : 1;
  }

  importarComplemento() {
    this.estaImportandoComplementos$.next(true);

    const desde = this.formularioComplementos.get('desde')?.value;
    const hasta = this.formularioComplementos.get('hasta')?.value;
    const pendienteDespacho =
      this.formularioComplementos.get('pendienteDespacho')?.value;
    const numeroRegistros =
      this.formularioComplementos.get('numeroRegistros')?.value;

    this._visitaService
      .importarComplementos({
        numeroRegistros,
        desde,
        hasta,
        pendienteDespacho,
      })
      .pipe(
        finalize(() => {
          this.estaImportandoComplementos$.next(false);
          this.cerrarModal();
          this.numeroDeRegistrosAImportar = 1;
          this.reiniciarFormulario();
        })
      )
      .subscribe((respuesta: { mensaje: string }) => {
        this.emitirConsultarLista.emit();
        this.alerta.mensajaExitoso(
          respuesta?.mensaje || 'Se han importado las visitas con éxito',
          'Importado con éxito.'
        );
        this.changeDetectorRef.detectChanges();
      });
  }

  reiniciarFormulario() {
    this.formularioComplementos.reset({
      numeroRegistros: 100,
      desde: '',
      hasta: '',
      pendienteDespacho: true,
    });
  }

  cerrarModal() {
    this.emitirCerrarModal.emit();
  }
}
