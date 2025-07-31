import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  tap,
  zip
} from 'rxjs';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { InputEmailComponent } from '../../../../common/components/ui/form/input-email/input-email.component';
import { InputComponent } from '../../../../common/components/ui/form/input/input.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { RespuestaContacto } from '../../../../interfaces/contacto/contacto.interface';
import {
  AutocompletarCiudades,
  AutocompletarIdentificacion,
  AutocompletarPlazoPagos,
  AutocompletarRegimen,
  AutocompletarTipoPersona,
} from '../../../../interfaces/general/autocompletar.interface';
import { ContactoService } from '../../servicios/contacto.service';
import { GeneralService } from '../../../../common/services/general.service';

@Component({
  selector: 'app-contacto-formulario',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    ReactiveFormsModule,
    InputEmailComponent,
    ButtonComponent,
    RouterLink,
    LabelComponent,
    NgSelectModule,
  ],
  templateUrl: './contacto-formulario.component.html',
  styleUrl: './contacto-formulario.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContactoFormularioComponent
  extends General
  implements OnInit {
  @Input() contacto: RespuestaContacto;
  @Input({ required: true }) formularioTipo: 'editar' | 'crear';
  @Output() emitirFormulario: EventEmitter<any> = new EventEmitter();

  private _contactoService = inject(ContactoService);
  private _generalService = inject(GeneralService);

  public arrTipoPersona: AutocompletarTipoPersona[] = [];
  public arrIdentificacion: AutocompletarIdentificacion[] = [];
  public arrRegimen: AutocompletarRegimen[] = [];
  public arrCiudades: AutocompletarCiudades[] = [];
  public arrPlazoPagos: AutocompletarPlazoPagos[] = [];
  public formularioContacto = this._contactoService.crearFormularioContacto();

  constructor() {
    super();
  }

  ngOnInit(): void {
    this._consultarInformacion();

    if (this.formularioTipo === 'editar') {
      this.formularioContacto.patchValue({
        identificacion: this.contacto.identificacion_id,
        numero_identificacion: this.contacto.numero_identificacion,
        digito_verificacion: this.contacto.digito_verificacion,
        nombre_corto: this.contacto.nombre_corto,
        nombre1: this.contacto.nombre1,
        nombre2: this.contacto.nombre2,
        apellido1: this.contacto.apellido1,
        apellido2: this.contacto.apellido2,
        correo: this.contacto.correo,
        telefono: this.contacto.telefono,
        celular: this.contacto.celular,
        direccion: this.contacto.direccion,
        ciudad: this.contacto.ciudad_id,
        ciudad_nombre: this.contacto.ciudad_nombre,
        barrio: this.contacto.barrio,
        tipo_persona: this.contacto.tipo_persona_id,
        regimen: this.contacto.regimen_id,
        codigo_ciuu: this.contacto.codigo_ciuu,
        plazo_pago: this.contacto.plazo_pago_id,
      });

    }

    this.consultarCiudad(this.formularioContacto.get('ciudad_nombre').value);

  }

  private _consultarInformacion() {
    zip(
      this._generalService.consultaApi('general/tipo_persona/seleccionar/'),
      this._generalService.consultaApi('general/identificacion/seleccionar/'),
      this._generalService.consultaApi('general/regimen/seleccionar/'),
      this._generalService.consultaApi('general/plazo_pago/seleccionar/')
    ).subscribe((respuesta: any) => {
      this.arrTipoPersona = respuesta[0];
      this.arrIdentificacion = respuesta[1];
      this.arrRegimen = respuesta[2];
      this.arrPlazoPagos = respuesta[3];
      this.changeDetectorRef.detectChanges();
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
    let arrFiltros = {
      'nombre__icontains': nombre,
      limit: 10,
    };

    this._generalService
      .consultaApi('general/ciudad/seleccionar/', arrFiltros)
      .pipe(
        tap((respuesta: any) => {
          this.arrCiudades = respuesta;
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

  enviar() {
    if (this.formularioContacto.valid) {
      if (Number(this.formularioContacto.get('tipo_persona').value) === 2) {
        let nombreCorto = '';
        const nombre1 = this.formularioContacto.get('nombre1')?.value;
        const nombre2 = this.formularioContacto.get('nombre2')?.value;
        const apellido1 = this.formularioContacto.get('apellido1')?.value;
        const apellido2 = this.formularioContacto.get('apellido2')?.value;

        nombreCorto = `${nombre1}`;
        if (nombre2 !== null) {
          nombreCorto += ` ${nombre2}`;
        }
        nombreCorto += ` ${apellido1}`;
        if (apellido2 !== null) {
          nombreCorto += ` ${apellido2}`;
        }

        this.formularioContacto
          .get('nombre_corto')
          ?.patchValue(nombreCorto, { emitEvent: false });
      }

      this.emitirFormulario.emit(this.formularioContacto.value);
    } else {
      this.formularioContacto.markAllAsTouched();
    }
  }
}
