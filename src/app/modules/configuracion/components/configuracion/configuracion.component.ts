import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { SwitchComponent } from '../../../../common/components/ui/form/switch/switch.component';
import { GeneralApiService } from '../../../../core';
import { General } from '../../../../common/clases/general';
import BuscadorDireccionesComponent from '../../../../common/components/buscador-direcciones/buscador-direcciones.component';
import { CommonModule, Location } from '@angular/common';
import { catchError, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { CargarImagenComponent } from '../../../../common/components/cargar-imagen/cargar-imagen.component';
import {
  empresaActualizacionImangenAction,
} from '../../../../redux/actions/empresa/empresa.actions';
import {
  configuracionActualizacionAction,
} from '../../../../redux/actions/configuracion/configuracion.actions';
import {
  obtenerEmpresaId,
  obtenerEmpresaImagen,
} from '../../../../redux/selectors/empresa.selectors';
import {
  obtenerConfiguracionInformacion,
} from '../../../../redux/selectors/configuracion.selectors';
import { EmpresaService } from '../../../empresa/servicios/empresa.service';
import { AlertaService } from '../../../../common/services/alerta.service';
import { PermisoPorDirective } from '../../../../common/directivas/permiso-por.directive';
import { FranjaService } from '../../../franja/servicios/franja.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    SwitchComponent,
    ReactiveFormsModule,
    BuscadorDireccionesComponent,
    CommonModule,
    CargarImagenComponent,
    PermisoPorDirective,
    RouterLink,
  ],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css',
})
export default class ConfiguracionComponent extends General implements OnDestroy {
  private _generalApiService = inject(GeneralApiService);
  private _location = inject(Location);
  private _empresaServices = inject(EmpresaService);
  private alertaService = inject(AlertaService);
  private _franjaService = inject(FranjaService);
  private destroy$ = new Subject<void>();
  obtenerEmpresaImagen$ = this.store.select(obtenerEmpresaImagen);
  mostrarModalConfirmacion = false;
  modalTitulo = '';
  modalDescripcion = '';
  private modalControl: FormControl | null = null;
  private ignorarCambios = false;
  /**
   * Snapshot del form tal como vino del backend (o tal como se guardo por
   * ultima vez). Lo usamos para comparar el value actual y decidir si
   * mostrar "Cambios sin guardar" — asi seleccionar la misma direccion u
   * otros cambios que terminan equivalentes no marcan el form como sucio.
   */
  private _baselineGuardado: any = null;

  public guardando = signal<boolean>(false);
  public tieneCambiosSinGuardar = signal<boolean>(false);
  public avisoFranjasVacias = signal<boolean>(false);

  /**
   * Solo los switches con impacto operativo amplio piden confirmacion al
   * usuario. Los demas (decodificar, geocerca) son seguros — toggle directo.
   */
  private switchDescripciones: Record<string, { titulo: string; descripcion: string; confirmar: boolean }> = {
    rut_sincronizar_complemento: {
      titulo: 'Sincronizar con Reddoc',
      descripcion: 'Las entregas se sincronizarán automáticamente con Reddoc. Si se desactiva, los datos no se actualizarán en el sistema externo.',
      confirmar: true,
    },
    rut_rutear_franja: {
      titulo: 'Rutear por franjas',
      descripcion: 'Las visitas se asignarán solo a vehículos cuyas franjas coincidan. Requiere franjas configuradas en vehículos y visitas.',
      confirmar: true,
    },
    rut_decodificar_direcciones: {
      titulo: 'Decodificar direcciones',
      descripcion: 'Al importar visitas, las direcciones se convertirán automáticamente a coordenadas.',
      confirmar: false,
    },
    rut_whatsapp_habilitado: {
      titulo: 'Notificaciones WhatsApp',
      descripcion: 'Se enviarán notificaciones WhatsApp a los destinatarios al aprobar despachos. Requiere tener configurada la conexión con WhatsApp.',
      confirmar: true,
    },
    rut_alerta_parada_activa: {
      titulo: 'Alerta de parada prolongada',
      descripcion: 'Se generará una alerta cuando un vehículo permanezca detenido más tiempo del permitido.',
      confirmar: false,
    },
    rut_alerta_geocerca_activa: {
      titulo: 'Alerta de salida de geocerca',
      descripcion: 'Se generará una alerta cuando un vehículo salga de la franja asignada a la visita en curso.',
      confirmar: false,
    },
  };

  formularioConfiguracion = new FormGroup({
    id: new FormControl(0),
    empresa: new FormControl(0),
    rut_sincronizar_complemento: new FormControl(true),
    rut_rutear_franja: new FormControl(false),
    rut_direccion_origen: new FormControl(''),
    rut_latitud: new FormControl<string | null>(null),
    rut_longitud: new FormControl<string | null>(null),
    rut_decodificar_direcciones: new FormControl(true),
    rut_hora_inicio: new FormControl('07:00'),
    rut_estrategia_ruteo: new FormControl('balanceado'),
    rut_cita_tipo_defecto: new FormControl('obligatoria'),
    rut_whatsapp_habilitado: new FormControl(false),
    rut_whatsapp_plantilla_despacho: new FormControl<string | null>(null),
    rut_whatsapp_plantilla_idioma: new FormControl('es'),
    rut_alerta_parada_activa: new FormControl(false),
    rut_alerta_parada_minutos: new FormControl(15),
    rut_alerta_parada_radio_metros: new FormControl(80),
    rut_alerta_geocerca_activa: new FormControl(false),
    rut_limite_complemento: new FormControl(1000),
    rut_limite_importacion: new FormControl(500),
    rut_alertas_intervalo_segundos: new FormControl(30),
  });

  goBack(): void {
    if (this.tieneCambiosSinGuardar()) {
      const ok = window.confirm(
        '¿Salir sin guardar? Los cambios se perderán.',
      );
      if (!ok) return;
    }
    this._location.back();
  }

  getUserImageUrl() {
    return this.obtenerEmpresaImagen$?.pipe(
      map((imagenEmpresa) => {
        if (!imagenEmpresa) return '';

        if (imagenEmpresa.includes('imagen')) {
          return imagenEmpresa;
        } else {
          return `${imagenEmpresa}?${new Date().getTime()}`;
        }
      })
    );
  }

  ngOnInit(): void {
    this.store
      .select(obtenerConfiguracionInformacion)
      .pipe(
        takeUntil(this.destroy$),
        tap((configuracion) => {
          if (configuracion.id > 0) {
            this.ignorarCambios = true;
            this.formularioConfiguracion.patchValue({
              id: configuracion.id,
              empresa: configuracion.empresa,
              rut_sincronizar_complemento: configuracion.rut_sincronizar_complemento,
              rut_rutear_franja: configuracion.rut_rutear_franja,
              rut_direccion_origen: configuracion.rut_direccion_origen,
              rut_latitud: configuracion.rut_latitud,
              rut_longitud: configuracion.rut_longitud,
              rut_decodificar_direcciones: configuracion.rut_decodificar_direcciones ?? true,
              rut_hora_inicio: configuracion.rut_hora_inicio || '07:00',
              rut_estrategia_ruteo: configuracion.rut_estrategia_ruteo || 'balanceado',
              rut_cita_tipo_defecto: configuracion.rut_cita_tipo_defecto || 'obligatoria',
              rut_whatsapp_habilitado: configuracion.rut_whatsapp_habilitado,
              rut_whatsapp_plantilla_despacho: configuracion.rut_whatsapp_plantilla_despacho ?? null,
              rut_whatsapp_plantilla_idioma: configuracion.rut_whatsapp_plantilla_idioma || 'es',
              rut_alerta_parada_activa: configuracion.rut_alerta_parada_activa,
              rut_alerta_parada_minutos: configuracion.rut_alerta_parada_minutos ?? 15,
              rut_alerta_parada_radio_metros: configuracion.rut_alerta_parada_radio_metros ?? 80,
              rut_alerta_geocerca_activa: configuracion.rut_alerta_geocerca_activa,
              rut_limite_complemento: configuracion.rut_limite_complemento ?? 1000,
              rut_limite_importacion: configuracion.rut_limite_importacion ?? 500,
              rut_alertas_intervalo_segundos: configuracion.rut_alertas_intervalo_segundos ?? 30,
            });
            this.ignorarCambios = false;
            this._baselineGuardado = this._snapshotForm();
            this.tieneCambiosSinGuardar.set(false);
          }
        })
      )
      .subscribe();

    // Switches con confirmacion: capturan el cambio y abren modal antes
    // de aplicar. El usuario puede cancelar.
    const switches = Object.entries(this.switchDescripciones);
    for (const [key, info] of switches) {
      const control = this.formularioConfiguracion.get(key) as FormControl;
      if (!control) continue;
      control.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (this.ignorarCambios) return;
          if (info.confirmar) {
            this.modalTitulo = info.titulo;
            this.modalDescripcion = info.descripcion;
            this.modalControl = control;
            this.mostrarModalConfirmacion = true;
          }
        });
    }

    // "Rutear por franjas": al activarlo, consulta franjas y avisa si no hay.
    this.formularioConfiguracion.controls.rut_rutear_franja.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((activo) => {
        if (this.ignorarCambios) return;
        if (activo) {
          this._verificarFranjas();
        } else {
          this.avisoFranjasVacias.set(false);
        }
      });

    // Marca el form como sucio solo si el value actual difiere del
    // baseline guardado. Asi seleccionar la misma direccion (o cualquier
    // cambio que termine en el mismo estado) no muestra "Cambios sin
    // guardar" innecesariamente.
    this.formularioConfiguracion.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.ignorarCambios) return;
        this.tieneCambiosSinGuardar.set(this._formDifiereDelBaseline());
      });
  }

  private _snapshotForm(): any {
    return JSON.parse(JSON.stringify(this.formularioConfiguracion.value));
  }

  private _formDifiereDelBaseline(): boolean {
    if (!this._baselineGuardado) return true;
    return (
      JSON.stringify(this.formularioConfiguracion.value) !==
      JSON.stringify(this._baselineGuardado)
    );
  }

  private _verificarFranjas() {
    this._franjaService
      .consultarFranjas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const total =
            res?.count ?? res?.cantidad_registros ?? (res?.results?.length ?? 0);
          this.avisoFranjasVacias.set(total === 0);
        },
        // Si el endpoint falla, no rompemos el toggle — solo no mostramos aviso.
        error: () => this.avisoFranjasVacias.set(false),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cerrarConfirmacion() {
    if (this.modalControl) {
      this.ignorarCambios = true;
      this.modalControl.setValue(!this.modalControl.value);
      this.ignorarCambios = false;
    }
    this.mostrarModalConfirmacion = false;
    this.modalControl = null;
  }

  confirmarCambio() {
    this.mostrarModalConfirmacion = false;
    this.modalControl = null;
  }

  submit() {
    if (this.guardando()) return;
    this.guardando.set(true);

    // Ultima linea de defensa: el backend rechaza "" en DecimalField, asi
    // que normalizamos lat/lon a null por si el form todavia los tiene
    // como string vacio (cargas legacy o casos no cubiertos).
    const raw = this.formularioConfiguracion.value as any;
    const payload = {
      ...raw,
      rut_latitud: raw.rut_latitud === '' ? null : raw.rut_latitud,
      rut_longitud: raw.rut_longitud === '' ? null : raw.rut_longitud,
    };

    this._generalApiService
      .guardarConfiguracion(payload, 1)
      .pipe(
        tap((response) => {
          this.store.dispatch(
            configuracionActualizacionAction({ configuracion: response })
          );
          this.alerta.mensajaExitoso('Configuración guardada correctamente');
          // Despues del save exitoso, el form actual ES el baseline.
          this._baselineGuardado = this._snapshotForm();
          this.tieneCambiosSinGuardar.set(false);
        }),
        catchError((err) => {
          // Loggea siempre el error completo para facilitar diagnostico en
          // produccion. El usuario ve solo el toast amigable.
          console.error('[configuracion.submit] error:', err);
          const status = err?.status ?? 0;
          let titulo = 'No se pudo guardar';
          let mensaje =
            err?.error?.detail || err?.error?.mensaje || 'Intenta nuevamente.';
          if (status === 403) {
            titulo = 'Sin permiso';
            mensaje =
              'Tu rol actual no permite modificar la configuración. Solicita acceso al administrador.';
          } else if (status === 0) {
            // status:0 puede ser red caida real (offline) o un error del
            // backend bloqueado por CORS/proxy. Distinguimos con navigator.onLine.
            if (typeof navigator !== 'undefined' && navigator.onLine === false) {
              titulo = 'Sin conexión';
              mensaje = 'Revisa tu conexión a internet e intenta de nuevo.';
            } else {
              titulo = 'No pudimos contactar al servidor';
              mensaje =
                'El servidor no respondió. Intenta de nuevo o contacta a soporte si persiste.';
            }
          }
          this.alertaService.mensajeError(titulo, mensaje);
          return of(null);
        }),
        tap(() => this.guardando.set(false)),
      )
      .subscribe();
  }

  onAddressSelected(addressData: any) {
    // El ng-select de buscador-direcciones emite null cuando el usuario limpia
    // la seleccion (boton "x"). Sin este guard se cae con TypeError leyendo
    // .address de null. Lat/lon van como null (no "") para que el backend los
    // acepte como NULL en DecimalField; "" rechazaria con 400.
    if (!addressData) {
      this.formularioConfiguracion.patchValue({
        rut_direccion_origen: '',
        rut_latitud: null,
        rut_longitud: null,
      });
      return;
    }
    // Solo patcheamos lat/lon si la API de detalle realmente las trajo —
    // a veces no vienen (response incompleto, place sin coordenadas). En
    // ese caso conservamos lo que ya tenia el form para no perderlas.
    const patch: Record<string, any> = {
      rut_direccion_origen: addressData.address,
    };
    if (addressData.latitude != null) patch['rut_latitud'] = addressData.latitude;
    if (addressData.longitude != null) patch['rut_longitud'] = addressData.longitude;
    this.formularioConfiguracion.patchValue(patch);
  }

  recuperarBase64(event: any) {
    this._empresaServices.cargarLogo(1, event).subscribe({
      next: (respuesta) => {
        if (respuesta.cargar) {
          this.alertaService.mensajaExitoso('Logo cargado con exito');
          this.store.dispatch(
            empresaActualizacionImangenAction({
              imagen: respuesta.imagen,
            })
          );
          this.changeDetectorRef.detectChanges();
        }
      },
    });
  }

  eliminarLogo(event: boolean) {
    this._empresaServices
      .eliminarLogoEmpresa(1)
      .pipe(
        switchMap((respuestaEliminarLogoEmpresa) => {
          if (respuestaEliminarLogoEmpresa.limpiar) {
            this.store.dispatch(
              empresaActualizacionImangenAction({
                imagen: respuestaEliminarLogoEmpresa.imagen,
              })
            );
          }
          return of(null);
        })
      )
      .subscribe();
  }
}
