import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { General } from '../../../../common/clases/general';
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';
import { ValidarBooleanoPipe } from '../../../../common/pipes/validar_booleano';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { NovedadService } from '../../servicios/novedad.service';
import { Novedad } from '../../interfaces/novedad.interface';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import { NovedadSolucionComponent } from '../novedad-solucion/novedad-solucion.component';
import { KTModal } from '../../../../../metronic/core';
import { ParametrosApi } from '../../../../core/types/api.type';

@Component({
  selector: 'app-novedad-tab',
  standalone: true,
  imports: [
    FormatFechaPipe,
    ValidarBooleanoPipe,
    CommonModule,
    ModalDefaultComponent,
    NovedadSolucionComponent,
  ],
  templateUrl: './novedad-tab.component.html',
  styleUrl: './novedad-tab.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NovedadTabComponent extends General implements OnInit {
  @Input() visitaId: number;

  private _destroy$ = new Subject<void>();
  private _novedadService = inject(NovedadService);
  public toggleModal$ = new BehaviorSubject(false);

  novedades = signal<Novedad[]>([]);

  selectedNovedadId: number | null = null;

  private baseParametrosConsulta: ParametrosApi = {
    limit: 50,
    ordering: '-fecha',
  };

  ngOnInit(): void {
    this._novedadService.actualizarLista$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.consultarNovedadPorVisita();
      });
    this.consultarNovedadPorVisita();
  }

  private getParametrosConsulta(): ParametrosApi {
    return {
      ...this.baseParametrosConsulta,
      'visita_id': this.visitaId.toString(),
    };
  }

  consultarNovedadPorVisita() {
    if (!this.visitaId) return;

    const parametros = this.getParametrosConsulta();

    this._novedadService.lista(parametros).subscribe({
      next: (respuesta) => {
        this.novedades.set(respuesta.results);
      },
      error: (error) => {
        console.error('Error al cargar visitas:', error);
      },
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.unsubscribe();
  }

  abrirModal(novedadId: number) {
    this.selectedNovedadId = novedadId;
    this.toggleModal$.next(true);
  }

  cerrarModal() {
    this.selectedNovedadId = null;
    this.toggleModal$.next(false);
  }

  actualizarNovedad() {
    this.modalDismiss();
  }

  modalDismiss() {
    const modalEl: HTMLElement = document.querySelector('#solucion-novedad-modal');
    const modal = KTModal.getInstance(modalEl);

    modal.toggle();
  }
}
