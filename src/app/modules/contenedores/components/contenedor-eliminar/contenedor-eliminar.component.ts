import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BehaviorSubject, catchError, finalize, of, Subject } from 'rxjs';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { InputComponent } from '../../../../common/components/ui/form/input/input.component';
import { Contenedor } from '../../../../interfaces/contenedor/contenedor.interface';
import { ContenedorService } from '../../services/contenedor.service';
import { KTModal } from '../../../../../metronic/core';

@Component({
  selector: 'app-contenedor-eliminar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './contenedor-eliminar.component.html',
  styleUrl: './contenedor-eliminar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContenedorEliminarComponent {
  @Input({ required: true }) contenedor: Contenedor;
  @Output() emitirEliminarContenedor: EventEmitter<any> = new EventEmitter();

  private contenedorService = inject(ContenedorService);
  public estaEliminandoContenedor$ = new BehaviorSubject<boolean>(false);

  formularioEliminar = new FormGroup({
    nombre: new FormControl('', Validators.compose([Validators.required])),
  });

  cerrar() {
    const modalEl: HTMLElement = document.querySelector('#eliminarContenedor');
    const modal = KTModal.getInstance(modalEl);

    modal.hide();
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
            this.cerrar();
          })
        )
        .subscribe((response) => {
          this.emitirEliminarContenedor.emit(true);
          // this.alerta.mensajaExitoso(
          //   'Se eliminó correctamente el contenedor.',
          //   'Guardado con éxito.'
          // );
        });
    }
  }
}
