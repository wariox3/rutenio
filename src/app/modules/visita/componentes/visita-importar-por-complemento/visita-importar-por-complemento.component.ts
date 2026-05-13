import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { KTModal } from '../../../../../metronic/core';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { InputDateComponent } from "../../../../common/components/ui/form/input-date/input-date/input-date.component";
import { InputComponent } from '../../../../common/components/ui/form/input/input.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { SwitchComponent } from '../../../../common/components/ui/form/switch/switch.component';
import { ComplementoService } from '../../../complementos/servicios/complemento.service';
import { VisitaApiService } from '../../servicios/visita-api.service';

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
    InputDateComponent
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
  public filtrosAbiertos = signal<boolean>(false);
  private _visitaApiService = inject(VisitaApiService);
  private _complementoService = inject(ComplementoService);
  public numeroDeRegistrosAImportar: number = 1;
  public formularioComplementos = new FormGroup(
    {
      numeroRegistros: new FormControl(
        100,
        Validators.compose([Validators.required])
      ),
      desde: new FormControl(null),
      hasta: new FormControl(null),
      fecha_desde: new FormControl(null),
      fecha_hasta: new FormControl(null),
      pendienteDespacho: new FormControl(true),
      novedad: new FormControl(false),
      codigoContacto: new FormControl(null),
      codigoDestino: new FormControl(null),
      codigoZona: new FormControl(null),
      codigo_despacho: new FormControl(null),
      complemento: new FormControl(null, Validators.required),
    },
    { validators: [this.validarRango(), this.validarRangoFecha()] }
  );

  // Signals derivados para el UI
  private _formValueSignal = signal(this.formularioComplementos.value);
  cantidadFiltrosActivos = computed(() => {
    const v = this._formValueSignal();
    // codigo_despacho NO se cuenta aqui: vive en la seccion 1 (Origen) como
    // identificador principal del lote a importar, no como filtro.
    const camposDeFiltro = [
      v.desde, v.hasta, v.fecha_desde, v.fecha_hasta,
      v.codigoContacto, v.codigoDestino, v.codigoZona,
    ];
    return camposDeFiltro.filter((x) => x !== null && x !== '' && x !== undefined).length;
  });

  constructor() {
    super();
    this.emitirConsultarLista = new EventEmitter();
    this.emitirCerrarModal = new EventEmitter();
    this.estaImportandoComplementos$ = new BehaviorSubject(false);
    this.getComplementos();
    // Mantener el signal sincronizado con el form para que los computed
    // (cantidadFiltrosActivos, textoBotonImportar) reaccionen.
    this.formularioComplementos.valueChanges.subscribe((v) =>
      this._formValueSignal.set(v)
    );
  }

  getComplementos() {
    this._complementoService.complementosInstalados().subscribe((response) => {
      this.complementos.set(response.results);
    });
  }

  validarRango(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const desde = formGroup.get('desde')?.value;
      const hasta = formGroup.get('hasta')?.value;

      // Si "hasta" es menor que "desde", retorna el error. Solo aplica si
      // ambos estan definidos.
      if (desde == null || hasta == null) return null;
      return hasta < desde ? { rangoInvalido: true } : null;
    };
  }

  validarRangoFecha(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const desde = formGroup.get('fecha_desde')?.value;
      const hasta = formGroup.get('fecha_hasta')?.value;
      if (!desde || !hasta) return null;
      return new Date(hasta) < new Date(desde) ? { rangoFechaInvalido: true } : null;
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
    const novedad = this.formularioComplementos.get('novedad')?.value;
    const numeroRegistros =
      this.formularioComplementos.get('numeroRegistros')?.value;
    const codigo_contacto = this.formularioComplementos.get('codigoContacto')?.value;
    const codigo_destino = this.formularioComplementos.get('codigoDestino')?.value;
    const codigo_zona = this.formularioComplementos.get('codigoZona')?.value;
    const complemento = this.formularioComplementos.get('complemento')?.value;
    const fecha_desde = this.formularioComplementos.get('fecha_desde')?.value;
    const fecha_hasta = this.formularioComplementos.get('fecha_hasta')?.value;
    const codigo_despacho = this.formularioComplementos.get('codigo_despacho')?.value;

    this._visitaApiService
      .importarPorComplemento({
        numeroRegistros,
        desde,
        hasta,
        pendienteDespacho,
        novedad,
        complemento,
        codigo_contacto,
        codigo_destino,
        codigo_zona,
        fecha_desde,
        fecha_hasta,
        codigo_despacho
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
    // Preserva el complemento elegido para que el usuario pueda importar
    // otra tanda con distintos filtros sin re-seleccionarlo.
    const complementoActual = this.formularioComplementos.controls.complemento.value;
    this.formularioComplementos.reset({
      numeroRegistros: 100,
      desde: null,
      hasta: null,
      pendienteDespacho: true,
      novedad: false,
      complemento: complementoActual,
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
