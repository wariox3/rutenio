import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  signal,
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
import { NgSelectModule } from '@ng-select/ng-select';
import { BehaviorSubject, finalize } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { InputComponent } from '../../../../common/components/ui/form/input/input.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { SwitchComponent } from '../../../../common/components/ui/form/switch/switch.component';
import { VisitaService } from '../../servicios/visita.service';
import { ComplementoService } from '../../../complementos/servicios/complemento.service';
import { KTModal } from '../../../../../metronic/core';

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
    NgSelectModule,
  ],
  templateUrl: './visita-importar-por-complemento.component.html',
  styleUrl: './visita-importar-por-complemento.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaImportarPorComplementoComponent extends General {
  @Output() emitirConsultarLista: EventEmitter<void>;
  @Output() emitirCerrarModal: EventEmitter<void>;

  public estaImportandoComplementos$: BehaviorSubject<boolean>;
  public complementos = signal<any[]>([]);
  private _visitaService = inject(VisitaService);
  private _complementoService = inject(ComplementoService);
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
      codigoContacto: new FormControl(null),
      codigoDestino: new FormControl(null),
      complemento: new FormControl(null, Validators.required),
    },
    { validators: this.validarRango() }
  );

  constructor() {
    super();
    this.emitirConsultarLista = new EventEmitter();
    this.emitirCerrarModal = new EventEmitter();
    this.estaImportandoComplementos$ = new BehaviorSubject(false);
    this.getComplementos();
  }

  getComplementos() {
    this._complementoService.complementosInstalados().subscribe((response) => {
      this.complementos.set(response.registros);
    });
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
    const codigo_contacto = this.formularioComplementos.get('codigoContacto')?.value;
    const codigo_destino = this.formularioComplementos.get('codigoDestino')?.value;
    const complemento = this.formularioComplementos.get('complemento')?.value;

    this._visitaService
      .importarComplementos({
        numeroRegistros,
        desde,
        hasta,
        pendienteDespacho,
        complemento,
        codigo_contacto,
        codigo_destino
      })
      .pipe(
        finalize(() => {
          this.estaImportandoComplementos$.next(false);
          this.modalDismiss();
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
    this.modalDismiss();
  }

   modalDismiss() {
      const modalEl: HTMLElement = document.querySelector('#importar-por-complemento-modal');
      const modal = KTModal.getInstance(modalEl);
  
      modal.toggle();
    }
}
