import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { BehaviorSubject, switchMap, tap } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { RespuestaContacto } from '../../../../interfaces/contacto/contacto.interface';
import { ContactoService } from '../../servicios/contacto.service';
import ContactoFormularioComponent from '../contacto-formulario/contacto-formulario.component';

@Component({
  selector: 'app-contacto-editar',
  standalone: true,
  imports: [CommonModule, ContactoFormularioComponent],
  templateUrl: './contacto-editar.component.html',
  styleUrl: './contacto-editar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContactoEditarComponent extends General implements OnInit {
  private _contactoService = inject(ContactoService);
  public contacto: RespuestaContacto;
  public cargando$ = new BehaviorSubject(false);

  constructor() {
    super();
  }

  ngOnInit(): void {
    this._consultarDetalle();
  }

  private _consultarDetalle() {
    this.cargando$.next(true);
    this.activatedRoute.params
      .pipe(
        switchMap((respuestaParametros: any) => {
          return this._contactoService.consultarDetalle(respuestaParametros.id);
        }),
        tap((respuestaConsultaDetalle) => {
          this.contacto = respuestaConsultaDetalle;
          this.cargando$.next(false);
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe();
  }

  enviarFormulario(formulario: any) {
    this._contactoService
      .actualizaContacto(this.contacto.id, formulario)
      .subscribe((respuesta: any) => {
        this.alerta.mensajaExitoso(
          'Se ha actualizado el contacto exitosamente.'
        );
        this.router.navigate([
          '/administracion/contacto/detalle',
          respuesta.id,
        ]);
      });
  }
}
