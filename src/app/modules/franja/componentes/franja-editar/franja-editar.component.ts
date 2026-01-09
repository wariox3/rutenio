import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Franja } from '../../../../interfaces/franja/franja.interface';
import { General } from '../../../../common/clases/general';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { InputComponent } from '../../../../common/components/ui/form/input/input.component';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { FranjaService } from '../../servicios/franja.service';
import { BehaviorSubject, finalize } from 'rxjs';

@Component({
  selector: 'app-franja-editar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LabelComponent,
    InputComponent,
    ButtonComponent,
  ],
  templateUrl: `./franja-editar.component.html`,
  styleUrl: './franja-editar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FranjaEditarComponent extends General {
  @Input({ required: true }) franja: Franja;
  @Output() emitirCerrarModal: EventEmitter<void>;

  public actualizandoFranja$: BehaviorSubject<boolean>;
  private _franjaService = inject(FranjaService);
  public formularioFranja = new FormGroup({
    codigo: new FormControl('', Validators.compose([Validators.required])),
    color: new FormControl(''),
    nombre: new FormControl('', Validators.compose([Validators.required])),
    coordenadas: new FormArray([]),
  });

  constructor() {
    super();
    this.emitirCerrarModal = new EventEmitter();
    this.actualizandoFranja$ = new BehaviorSubject(false);
  }

  ngOnInit(): void {
    this._initFormulario();
  }

  private _initFormulario() {
    const coordenadasArray = this.formularioFranja.get(
      'coordenadas'
    ) as FormArray;

    coordenadasArray.clear();

    this.formularioFranja.patchValue({
      codigo: this.franja?.codigo,
      color: '#' + this.franja?.color,
      nombre: this.franja?.nombre,
    });

    this.franja.coordenadas.forEach((coordenada: any) => {
      coordenadasArray.push(new FormControl(coordenada));
    });
  }

  actualizarFranja() {
    this.actualizandoFranja$.next(true);
    const color = this.formularioFranja.get('color').value;
    const colorOriginal = color;
    
    // Crear una copia de los datos del formulario para el envío
    const datosParaEnvio = {
      ...this.formularioFranja.value,
      color: color.slice(1), // Remover el # solo para el envío
    };
    
    this._franjaService
      .actualizarFranja(this.franja.id, datosParaEnvio)
      .pipe(
        finalize(() => {
          this.actualizandoFranja$.next(false);
        })
      )
      .subscribe({
        next: () => {
          this.alerta.mensajaExitoso('Se ha actualizado la franja exitosamente.');
          this.emitirCerrarModal.emit();
        },
        error: (error) => {
          // Restaurar el color original en caso de error
          this.formularioFranja.patchValue({
            color: colorOriginal,
          });
          this.alerta.mensajeError('Error al actualizar la franja', 'Por favor intente nuevamente.');
        }
      });
  }

  onColorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formularioFranja.patchValue({
      color: input.value,
    });
  }
}
