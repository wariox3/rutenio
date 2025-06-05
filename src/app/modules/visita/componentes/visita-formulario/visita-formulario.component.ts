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
import { InputEmailComponent } from '../../../../common/components/ui/form/input-email/input-email.component';
import { InputComponent } from '../../../../common/components/ui/form/input/input.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { GeneralApiService } from '../../../../core';
import { AutocompletarCiudades } from '../../../../interfaces/general/autocompletar.interface';
import { VisitaApiService } from '../../servicios/visita-api.service';

@Component({
  selector: 'app-visita-formulario',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    ReactiveFormsModule,
    RouterLink,
    InputComponent,
    InputEmailComponent,
    LabelComponent,
    NgSelectModule,
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

  public formularioVisita = new FormGroup({
    numero: new FormControl(''),
    documento: new FormControl(null),
    destinatario: new FormControl('', [Validators.required]),
    destinatario_direccion: new FormControl('', [Validators.required]),
    destinatario_telefono: new FormControl(null),
    destinatario_correo: new FormControl(null),
    peso: new FormControl('', [Validators.required, Validators.min(1)]),
    volumen: new FormControl('', [Validators.required, Validators.min(1)]),
    ciudad_nombre: new FormControl(''),
    ciudad: new FormControl(null, [Validators.required]),
  });

  ngOnInit(): void {
    if (this.formularioTipo === 'editar') {
      this.formularioVisita.patchValue({
        numero: this.informacionVisita.numero,
        documento: this.informacionVisita.documento,
        destinatario: this.informacionVisita.destinatario,
        destinatario_direccion: this.informacionVisita.destinatario_direccion,
        destinatario_telefono: this.informacionVisita.destinatario_telefono,
        destinatario_correo: this.informacionVisita.destinatario_correo,
        ciudad: this.informacionVisita.ciudad_id,
        ciudad_nombre: this.informacionVisita.ciudad_nombre,
      });
      this.ciudadSeleccionada = {
        id: this.informacionVisita.ciudad_id,
        nombre: this.informacionVisita.ciudad_nombre,
      };
    }

    this.consultarCiudad(this.formularioVisita.get('ciudad_nombre').value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  enviar() {
    if (this.formularioVisita.valid) {
      const formularioPreparado = this.prepararDatosEnvio(this.formularioVisita.value)
      this.dataFormulario.emit(formularioPreparado)
    } else {
      this.formularioVisita.markAllAsTouched();
    }
  }

  enviarModal() {
    const datos = this.prepararDatosEnvio(this.formularioVisita.value);
    this._visitaApiService
      .guardar(datos)
      .pipe(takeUntil(this.destroy$))
      .subscribe((respuesta: any) => {
        this.alerta.mensajaExitoso('Se ha creado la visita exitosamente.');
        this.dataFormulario.emit();
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
      filtros: [
        {
          operador: 'icontains',
          propiedad: 'nombre',
          valor1: nombre,
          valor2: '',
        },
      ],
      limite: 10,
      desplazar: 0,
      ordenamientos: [],
      limite_conteo: 10000,
      modelo: 'GenCiudad',
      serializador: 'ListaAutocompletar',
    };

    this._generalApiService
      .getLista<AutocompletarCiudades[]>(arrFiltros)
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

    this.formularioVisita.patchValue({
      ciudad: ciudad.id,
      ciudad_nombre: ciudad.nombre,
    });
  }

  private prepararDatosEnvio(formData: any): any {
    const direccionCompleta =
      `${formData.destinatario_direccion}, ${formData.ciudad_nombre}`
        .toUpperCase()
        .trim()
        .replace(/\s+/g, ' ');

    return {
      ...formData,
      destinatario_direccion: direccionCompleta,
    };
  }
}
