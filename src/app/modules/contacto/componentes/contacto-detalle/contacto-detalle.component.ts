import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { General } from '../../../../common/clases/general';
import { ContactoService } from '../../servicios/contacto.service';
import { switchMap, tap } from 'rxjs';
import { RespuestaContacto } from '../../../../interfaces/contacto/contacto.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contacto-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contacto-detalle.component.html',
  styleUrl: './contacto-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContactoDetalleComponent
  extends General
  implements OnInit
{
  private _contactoService = inject(ContactoService);
  public contacto: RespuestaContacto;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this._consultarDetalle();
  }

  private _consultarDetalle() {
    this.activatedRoute.params
      .pipe(
        switchMap((respuestaParametros: any) => {
          return this._contactoService.consultarDetalle(respuestaParametros.id);
        }),
        tap((respuestaConsultaDetalle) => {
          this.contacto = respuestaConsultaDetalle;
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe();
  }
}
