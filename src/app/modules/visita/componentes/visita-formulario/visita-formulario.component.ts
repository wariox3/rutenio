import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { Subject, takeUntil, tap } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { GeneralApiService } from '../../../../core';
import { AutocompletarCiudades } from '../../../../interfaces/general/autocompletar.interface';
import { VisitaApiService } from '../../servicios/visita-api.service';
import { cambiarVacioPorNulo } from '../../../../common/validaciones/campo-no-obligatorio.validator';
import { CitaRangoValidator } from '../../../../common/validaciones/cita-rango.validator';
import { NoSoloEspacios } from '../../../../common/validaciones/no-solo-espacios.validator';
import { TelefonoWhatsappValidator } from '../../../../common/validaciones/telefono-whatsapp.validator';
import { InputComponent as InputUiComponent } from '@tamerlantian/ui-components';
import { InputNumericoValidator } from '../../../../common/validaciones/input-numerico.validator';

@Component({
  selector: 'app-visita-formulario',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    ReactiveFormsModule,
    RouterLink,
    LabelComponent,
    NgSelectModule,
    InputUiComponent,
  ],
  templateUrl: 'visita-formulario.component.html',
  styleUrl: './visita-formulario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaFormularioComponent
  extends General
  implements OnInit, OnDestroy
{
  private _visitaApiService = inject(VisitaApiService);
  private _generalApiService = inject(GeneralApiService);

  @Input() informacionVisita: any;
  @Input({ required: true }) formularioTipo: 'editar' | 'crear';
  @Input() isModal: boolean;
  @Output() dataFormulario: EventEmitter<any> = new EventEmitter();
  public arrCiudades: AutocompletarCiudades[] = [];
  public ciudadSeleccionada: any;
  private destroy$ = new Subject<void>();
  public minFechaCita = this.obtenerFechaHoraActual();

  private obtenerFechaHoraActual(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  // Email RFC-ish basico pero mas estricto que Validators.email (que acepta a@b).
  private readonly PATRON_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  public formularioVisita = new FormGroup({
    numero: new FormControl<number | null>(null, [
      cambiarVacioPorNulo.validar,
      Validators.min(1),
      Validators.max(2147483647),
    ]),
    documento: new FormControl<string | null>(null, [NoSoloEspacios.validar]),
    destinatario: new FormControl('', [
      Validators.required,
      NoSoloEspacios.validar,
      Validators.maxLength(150),
    ]),
    destinatario_direccion: new FormControl('', [
      Validators.required,
      NoSoloEspacios.validar,
      Validators.maxLength(200),
    ]),
    fecha: new FormControl<Date | string>(new Date(), [Validators.required]),
    destinatario_telefono: new FormControl<string | null>(null, [
      NoSoloEspacios.validar,
      TelefonoWhatsappValidator.validar,
    ]),
    destinatario_correo: new FormControl<string | null>(null, [
      Validators.pattern(this.PATRON_EMAIL),
    ]),
    // Unidades: minimo 1 (al menos una unidad real para entregar).
    unidades: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
    // Peso, volumen: aceptamos 0 (ej. documentos). Si quieren forzar, lo cambian luego.
    peso: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
    ]),
    volumen: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
    ]),
    cobro: new FormControl<number | null>(0, [Validators.min(0)]),
    tarifa: new FormControl<number | null>(0, [Validators.min(0)]),
    // Tiempo servicio: aceptamos 0 (entrega expresa sin demora).
    tiempo_servicio: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
    ]),
    ciudad_nombre: new FormControl<string | null>(''),
    ciudad: new FormControl<number | null>(null, [Validators.required]),
    observacion: new FormControl<string | null>(null, [Validators.maxLength(500)]),
    destinatario_direccion_complemento: new FormControl<string | null>(null, [
      Validators.maxLength(200),
    ]),
    cita_inicio: new FormControl<string | null>(null),
    cita_fin: new FormControl<string | null>(null),
  }, { validators: CitaRangoValidator.validar });

  // Loading state expuesto al template para desactivar el boton Guardar.
  public guardando = false;

  /** True si el telefono actual cumple formato y ademas parece celular CO (recibira WhatsApp). */
  get telefonoRecibiraWhatsapp(): boolean {
    const ctrl = this.formularioVisita.get('destinatario_telefono');
    if (!ctrl || ctrl.invalid || !ctrl.value) return false;
    return TelefonoWhatsappValidator.esCelularCO(ctrl.value);
  }

  /** True si el telefono es valido pero NO parece celular CO (no recibira la plantilla). */
  get telefonoSinWhatsapp(): boolean {
    const ctrl = this.formularioVisita.get('destinatario_telefono');
    if (!ctrl || ctrl.invalid || !ctrl.value) return false;
    return !TelefonoWhatsappValidator.esCelularCO(ctrl.value);
  }

  /** Valores por defecto del formulario (usados al crear o al resetear). */
  private readonly _defaultsFormulario = {
    numero: null,
    documento: null,
    destinatario: '',
    destinatario_direccion: '',
    fecha: new Date(),
    destinatario_telefono: null,
    destinatario_correo: null,
    unidades: null,
    peso: null,
    volumen: null,
    cobro: 0,
    tarifa: 0,
    tiempo_servicio: null,
    ciudad_nombre: '',
    ciudad: null,
    observacion: null,
    destinatario_direccion_complemento: null,
    cita_inicio: null,
    cita_fin: null,
  };

  ngOnInit(): void {
    if (this.formularioTipo === 'editar') {
      this.formularioVisita.reset(this._defaultsFormulario);
      this.formularioVisita.patchValue({
        numero: this.informacionVisita.numero,
        documento: this.informacionVisita.documento,
        destinatario: this.informacionVisita.destinatario,
        destinatario_direccion: this._desconcatenarCiudad(
          this.informacionVisita.destinatario_direccion,
          this.informacionVisita.ciudad__nombre,
        ),
        destinatario_telefono: this.informacionVisita.destinatario_telefono,
        destinatario_correo: this.informacionVisita.destinatario_correo,
        ciudad: this.informacionVisita.ciudad,
        ciudad_nombre: this.informacionVisita.ciudad__nombre,
        tiempo_servicio: this.informacionVisita.tiempo_servicio,
        peso: this.informacionVisita.peso,
        volumen: this.informacionVisita.volumen,
        unidades: this.informacionVisita.unidades,
        cobro: this.informacionVisita.cobro || 0,
        tarifa: this.informacionVisita.tarifa || 0,
        fecha: this.informacionVisita.fecha,
        observacion: this.informacionVisita.observacion,
        destinatario_direccion_complemento: this.informacionVisita.destinatario_direccion_complemento,
        cita_inicio: this.normalizarCitaParaInput(this.informacionVisita.cita_inicio),
        cita_fin: this.normalizarCitaParaInput(this.informacionVisita.cita_fin),
      });
      this.ciudadSeleccionada = {
        id: this.informacionVisita.ciudad,
        nombre: this.informacionVisita.ciudad__nombre,
      };
      // Pre-cargar la ciudad actual en arrCiudades para que ng-select pueda
      // resolver el label antes de que la consulta async traiga la lista.
      // Sin esto, el control tiene el id correcto pero el select se pinta vacio.
      if (this.informacionVisita.ciudad && this.informacionVisita.ciudad__nombre) {
        this.arrCiudades = [
          {
            id: this.informacionVisita.ciudad,
            nombre: this.informacionVisita.ciudad__nombre,
          } as AutocompletarCiudades,
        ];
      }
    } else {
      // Modo crear: si Angular reuso la instancia (modal abierto despues de un
      // editar, o navegacion entre crear/editar), el formGroup mantiene los
      // valores anteriores. Reseteamos a defaults para evitar arrastre de datos.
      this.formularioVisita.reset(this._defaultsFormulario);
      this.ciudadSeleccionada = null;
      this.arrCiudades = [];
    }

    this.consultarCiudad(this.formularioVisita.get('ciudad_nombre').value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getCurrentDateTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  enviar() {
    if (this.guardando) return;
    if (this.formularioVisita.valid) {
      this.guardando = true;
      const formularioPreparado = this.prepararDatosEnvio(
        this.formularioVisita.value
      );
      this.dataFormulario.emit(formularioPreparado);
      // El padre maneja la respuesta. Si vuelve a este formulario el guardando
      // se reinicia desde el padre o al re-abrir el modal.
    } else {
      this.formularioVisita.markAllAsTouched();
      this.changeDetectorRef.detectChanges();
    }
  }

  enviarModal() {
    if (this.guardando) return;
    if (!this.formularioVisita.valid) {
      this.formularioVisita.markAllAsTouched();
      this.changeDetectorRef.detectChanges();
      return;
    }
    const datos = this.prepararDatosEnvio(this.formularioVisita.value);

    // En modo editar el modal delega al padre (que decide el endpoint).
    // En modo crear, sigue llamando guardar() directo.
    if (this.formularioTipo === 'editar') {
      this.guardando = true;
      this.dataFormulario.emit(datos);
      return;
    }
    this.guardando = true;
    this._visitaApiService
      .guardar(datos)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.guardando = false;
          this.alerta.mensajaExitoso('Se ha creado la visita exitosamente.');
          this.dataFormulario.emit();
          this.changeDetectorRef.detectChanges();
        },
        error: () => {
          this.guardando = false;
          this.changeDetectorRef.detectChanges();
        },
      });
  }

  buscarCiudadPorNombre(event?: any) {
    const excludedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

    if (excludedKeys.includes(event?.key)) {
      return;
    }

    const ciudadNombre = event?.target.value || '';
    this.consultarCiudad(ciudadNombre);
  }

  consultarCiudad(nombre?: string) {
    this._generalApiService
      .consultaApi<AutocompletarCiudades[]>('general/ciudad/seleccionar/', {
        nombre__icontains: nombre,
        limit: 10,
      })
      .pipe(
        tap((respuesta) => {
          // Asegurar que la ciudad seleccionada actual sigue presente, sino
          // ng-select la "pierde" cuando reemplaza items y queda con id sin label.
          const ciudadIdActual = this.formularioVisita.get('ciudad')?.value;
          const lista = respuesta || [];
          if (
            ciudadIdActual &&
            !lista.some((c) => c.id === ciudadIdActual) &&
            this.ciudadSeleccionada
          ) {
            lista.unshift(this.ciudadSeleccionada);
          }
          this.arrCiudades = lista;
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe();
  }

  seleccionarCiudad(ciudad: any) {
    if (!ciudad) {
      this.consultarCiudad('');
      return;
    }

    this.formularioVisita.patchValue({
      ciudad: ciudad.id,
      ciudad_nombre: ciudad.nombre,
    });
  }

  /**
   * Quita la ciudad concatenada al final de la direccion para evitar duplicarla
   * al re-editar. Compara case-insensitive y tolera variaciones de espacios.
   * Ej: "CL 4 17 115, MEDELLÍN" + ciudad "MEDELLÍN" -> "CL 4 17 115"
   */
  private _desconcatenarCiudad(direccion: string | null | undefined, ciudad: string | null | undefined): string {
    if (!direccion) return '';
    if (!ciudad) return direccion;
    const direccionTrim = direccion.trim();
    const ciudadTrim = ciudad.trim();
    if (!ciudadTrim) return direccionTrim;
    const sufijo = `, ${ciudadTrim}`.toUpperCase().replace(/\s+/g, ' ');
    const directoUpper = direccionTrim.toUpperCase().replace(/\s+/g, ' ');
    if (directoUpper.endsWith(sufijo)) {
      return direccionTrim.substring(0, direccionTrim.length - sufijo.length).trim().replace(/,\s*$/, '');
    }
    return direccionTrim;
  }

  private prepararDatosEnvio(formData: any): any {
    const direccionBase = this._desconcatenarCiudad(
      formData.destinatario_direccion,
      formData.ciudad_nombre,
    );
    const ciudad = (formData.ciudad_nombre || '').trim();
    const direccionCompleta = (ciudad
      ? `${direccionBase}, ${ciudad}`
      : direccionBase)
      .toUpperCase()
      .replace(/\s+/g, ' ')
      .trim();

    const datos = {
      ...formData,
      destinatario_direccion: direccionCompleta,
    };

    if (!datos.cita_inicio || !datos.cita_fin) {
      datos.cita_inicio = null;
      datos.cita_fin = null;
    } else {
      datos.cita_inicio = this.formatearCitaParaApi(datos.cita_inicio);
      datos.cita_fin = this.formatearCitaParaApi(datos.cita_fin);
    }

    return datos;
  }

  private formatearCitaParaApi(valor: string): string {
    if (!valor) return valor;
    const formatted = valor.length === 16 ? `${valor}:00` : valor;
    return formatted.replace('T', ' ');
  }

  private normalizarCitaParaInput(valor: string | null): string | null {
    if (!valor) return null;
    return valor.replace(' ', 'T').substring(0, 16);
  }

  onKeyDown(event: KeyboardEvent): void {
    InputNumericoValidator.onKeyDown(event);
  }
}
