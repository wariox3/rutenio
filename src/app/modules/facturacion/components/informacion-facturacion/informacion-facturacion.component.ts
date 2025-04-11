import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { General } from '../../../../common/clases/general';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ContenedorService } from '../../../contenedores/services/contenedor.service';
import { FacturacionService } from '../../servicios/facturacion.service';
import { obtenerUsuarioId } from '../../../../redux/selectors/usuario.selector';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { InputComponent } from '../../../../common/components/ui/form/input/input.component';
import { tap, zip } from 'rxjs';
import { TipoIdentificacion } from '../../../../interfaces/identificacion/identificacion.interface';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { InputEmailComponent } from '../../../../common/components/ui/form/input-email/input-email.component';
import { DevuelveDigitoVerificacionService } from '../../../../common/services/devuelve-digito-verificacion.service';
import { KTModal } from '../../../../../metronic/core';

@Component({
  selector: 'app-informacion-facturacion',
  standalone: true,
  imports: [
    ButtonComponent,
    ReactiveFormsModule,
    LabelComponent,
    InputComponent,
    NgSelectModule,
    CommonModule,
    InputEmailComponent,
  ],
  templateUrl: './informacion-facturacion.component.html',
  styleUrl: './informacion-facturacion.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformacionFacturacionComponent extends General implements OnInit {
  public arrIdentificacion: TipoIdentificacion[];
  public arrCiudades: any;
  codigoUsuario = 0;
  ciudadSeleccionada: string | null;
  @Input() informacionFacturacionId: string = '';
  @Input() estaEditando: boolean = false;
  @Output() emitirActualizacion: EventEmitter<any> = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private facturacionService: FacturacionService,
    private contenedorService: ContenedorService,
    private devuelveDigitoVerificacionService: DevuelveDigitoVerificacionService
  ) {
    super();
  }

  public formularioInformacionFacturacion = new FormGroup({
    digito_verificacion: new FormControl(
      null,
      Validators.compose([Validators.required, Validators.maxLength(1)])
    ),
    identificacion: new FormControl(
      null,
      Validators.compose([Validators.required])
    ),
    numero_identificacion: new FormControl(
      '',
      Validators.compose([Validators.required])
    ),
    direccion: new FormControl(null),
    correo: new FormControl(null, Validators.compose([Validators.required])),
    telefono: new FormControl(0),
    nombre_corto: new FormControl(
      null,
      Validators.compose([Validators.maxLength(200), Validators.required])
    ),
    identificacion_id: new FormControl(null),
    ciudad_nombre: new FormControl(''),
    ciudad: new FormControl(null, Validators.compose([Validators.required])),
    usuario: new FormControl(null),
  });

  ngOnInit(): void {
    if (this.informacionFacturacionId) {
      this._poblarFormulario();
    }
    this._consultarInformacion();
    this.store.select(obtenerUsuarioId).subscribe((codigoUsuario) => {
      this.formularioInformacionFacturacion.patchValue({
        usuario: codigoUsuario,
      });
    });

    this.formularioInformacionFacturacion
      .get('numero_identificacion')
      .valueChanges.subscribe((value) => {
        if (value && value.length > 0) {
          this.calcularDigitoVerificacion();
        }
      });
  }

  private _poblarFormulario() {
    this.facturacionService.obtenerInformacionFacturacion(this.informacionFacturacionId).subscribe((respuesta: any) => {
      this.formularioInformacionFacturacion.patchValue({
        nombre_corto: respuesta.nombre_corto,
        numero_identificacion: respuesta.numero_identificacion,
        direccion: respuesta.direccion,
        telefono: respuesta.telefono,
        identificacion: respuesta.identificacion_id,
        ciudad: respuesta.ciudad_id,
        correo: respuesta.correo,
        ciudad_nombre: respuesta.ciudad_nombre,
        usuario: respuesta.usuario_id,
        digito_verificacion: respuesta.digito_verificacion,
      });
      this.consultarCiudad(
        this.formularioInformacionFacturacion.get('ciudad_nombre').value
      );
    })
    
  }

  private _consultarInformacion() {
    zip(this.contenedorService.listaTipoIdentificacion()).subscribe(
      (respuesta) => {
        this.arrIdentificacion = respuesta[0].registros;
        this.changeDetectorRef.detectChanges();
      }
    );
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
    let arrFiltros = {
      filtros: [
        {
          propiedad: 'nombre__icontains',
          valor1: nombre,
        },
      ],
      limite: 10,
      desplazar: 0,
      ordenamientos: [],
      limite_conteo: 10000,
      modelo: 'CtnCiudad',
      serializador: 'ListaAutocompletar',
    };

    this.contenedorService
      .listaCiudades(arrFiltros)
      .pipe(
        tap((respuesta) => {
          this.arrCiudades = respuesta.registros;
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
  }

  enviarFormulario() {
    if(this.estaEditando){
      this.facturacionService.actualizarDatosInformacionFacturacion(
        this.informacionFacturacionId,
        this.formularioInformacionFacturacion.value
      ).subscribe((respuesta:any) => {
        this.alerta.mensajaExitoso(
          'Se ha actualizado la información de facturación correctamente.'
        );
        this.dismissModal();
        return this.emitirActualizacion.emit(true);
      })
    } else {
      this.facturacionService
      .crearInformacionFacturacion(this.formularioInformacionFacturacion.value)
      .subscribe((respuesta: any) => {
        this.alerta.mensajaExitoso(
          'Se ha creado la información de facturación correctamente.'
        );
        this.dismissModal();
      });
    }
  }

  calcularDigitoVerificacion() {
    const numeroIdentificacion = this.formularioInformacionFacturacion.get(
      'numero_identificacion'
    )?.value;

    if (numeroIdentificacion && numeroIdentificacion.length > 0) {
      const numero = Number(numeroIdentificacion);

      let digito =
        this.devuelveDigitoVerificacionService.digitoVerificacion(numero);

      this.formularioInformacionFacturacion.patchValue({
        digito_verificacion: digito,
      });
    }
  }

  dismissModal() {
    const modalEl: HTMLElement = document.querySelector('#informacion-facturacion');
    const modal = KTModal.getInstance(modalEl);
    modal.toggle();
    this.resetearComponente();
  }

  resetearComponente() {
    this.formularioInformacionFacturacion.reset();
    this.arrCiudades = null;
    this.ciudadSeleccionada = null;
    this.informacionFacturacionId = '';
  }
}
