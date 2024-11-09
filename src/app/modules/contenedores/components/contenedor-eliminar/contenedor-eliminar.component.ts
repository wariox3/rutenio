import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BehaviorSubject, catchError, finalize, of } from 'rxjs';
import { KTModal } from '../../../../../metronic/core';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { InputComponent } from '../../../../common/components/ui/form/input/input.component';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import { Contenedor } from '../../../../interfaces/contenedor/contenedor.interface';
import { ContenedorService } from '../../services/contenedor.service';

@Component({
  selector: 'app-contenedor-eliminar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    ModalDefaultComponent,
  ],
  templateUrl: './contenedor-eliminar.component.html',
  styleUrl: './contenedor-eliminar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContenedorEliminarComponent extends General {
  @Input({ required: true }) contenedor: Contenedor;
  @Output() emitirEliminarContenedor: EventEmitter<any> = new EventEmitter();

  private contenedorService = inject(ContenedorService);
  public estaEliminandoContenedor$ = new BehaviorSubject<boolean>(false);

  formularioEliminar = new FormGroup({
    nombre: new FormControl('', Validators.compose([Validators.required])),
  });

  cerrarModal() {
    const modalEl: HTMLElement = document.querySelector('#eliminarContenedor');
    const modal = KTModal.getInstance(modalEl);

    modal.hide();
  }

  cancelarModal() {
    this._reiniciarFormulario();
  }

  private _reiniciarFormulario() {
    this.formularioEliminar.reset();
    this.formularioEliminar.markAsUntouched();
    this.formularioEliminar.markAsPristine();
    this.changeDetectorRef.detectChanges();
  }

  eliminarContenedor() {
    if (
      this.formularioEliminar.get('nombre')?.value.trim() ===
      this.contenedor.subdominio.trim()
    ) {
      const contenedorId = this.contenedor.contenedor_id;
      this.estaEliminandoContenedor$.next(true);

      this.contenedorService
        .eliminarContenedor(contenedorId)
        .pipe(
          catchError(() => {
            this.emitirEliminarContenedor.emit(true);
            return of(null);
          }),
          finalize(() => {
            this.estaEliminandoContenedor$.next(false);
            this.cerrarModal();
          })
        )
        .subscribe((response) => {
          this.emitirEliminarContenedor.emit(true);
          this.alerta.mensajaExitoso('Se eliminó correctamente el contenedor.');
        });
    }
  }
}
