import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { finalize } from 'rxjs';
import { General } from '../../../../common/clases/general';
import {
  DespachoDetalle,
  despachoDetalleEmpty,
} from '../../../../interfaces/despacho/despacho.interface';
import { DespachoApiService } from '../../servicios/despacho-api.service';
import DespachoFormularioComponent from '../despacho-formulario/despacho-formulario.component';

@Component({
  selector: 'app-despacho-editar',
  standalone: true,
  imports: [CommonModule, DespachoFormularioComponent],
  templateUrl: './despacho-editar.component.html',
  styleUrl: './despacho-editar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DespachoEditarComponent extends General implements OnInit {
  private _despachoApiService = inject(DespachoApiService);

  public cargando = signal<boolean>(false);
  public despacho = signal<DespachoDetalle>(despachoDetalleEmpty);
  public detalleId: number;

  ngOnInit(): void {
    this.detalleId = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    this._getDespacho(this.detalleId);
  }

  private _getDespacho(id: number) {
    this.cargando.set(true);
    this._despachoApiService
      .getDetalle(id)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe((resultado) => {
        this.despacho.set(resultado);
      });
  }

  submitFormulario(despacho: DespachoDetalle) {
    this._despachoApiService
      .actualizar(this.detalleId, despacho)
      .subscribe((respuesta) => {
        this.alerta.mensajaExitoso(
          'Se ha actualizado el despacho exitosamente.'
        );
        this.router.navigate([
          '/movimiento/despacho/detalle',
          respuesta.id,
        ]);
      });
  }
}
