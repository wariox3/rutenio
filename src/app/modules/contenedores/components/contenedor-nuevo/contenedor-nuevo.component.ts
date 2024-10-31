import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { catchError, of, switchMap, tap } from 'rxjs';
import { General } from '../../../../common/clases/general';
import {
  ContenedorFormulario,
  NuevoContenedorRespuesta,
} from '../../../../interfaces/contenedor/contenedor.interface';
import { obtenerUsuarioId } from '../../../../redux/selectors/usuario.selector';
import { ContenedorService } from '../../services/contenedor.service';
import { ContenedorFormularioComponent } from '../contenedor-formulario/contenedor-formulario.component';

@Component({
  selector: 'app-contenedor-nuevo',
  standalone: true,
  imports: [CommonModule, ContenedorFormularioComponent],
  templateUrl: './contenedor-nuevo.component.html',
  styleUrl: './contenedor-nuevo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContenedorNuevoComponent extends General {
  private contenedorService = inject(ContenedorService);
  procesando = false;
  codigoUsuario = '';

  informacionContenedor: ContenedorFormulario = {
    nombre: '',
    subdominio: '',
    plan_id: 0,
    correo: '',
    telefono: '',
    reddoc: false,
    ruteo: true,
    usuario_id: '',
  };

  ngOnInit(): void {
    this.consultarInformacion();
  }

  consultarInformacion() {
    this.store.select(obtenerUsuarioId).subscribe((codigoUsuario) => {
      this.codigoUsuario = codigoUsuario;
    });
  }

  enviarFormulario(formulario: any) {
    this.procesando = true;
    this.contenedorService
      .consultarNombre(formulario.subdominio)
      .pipe(
        switchMap(({ validar }) => {
          if (validar) {
            return this.contenedorService.nuevo(formulario, this.codigoUsuario);
          }
          return of(null);
        }),
        tap((respuestaNuevo: NuevoContenedorRespuesta) => {
          if (respuestaNuevo.contenedor) {
            // this.alerta.mensajaExitoso(
            //   "Se ha creado el contenedor exitosamente.",
            //   "Guardado con éxito."
            // );
            this.router.navigate(['/contenedor/lista']);
            this.procesando = false;
          }
        }),
        catchError(() => {
          this.procesando = false;
          this.changeDetectorRef.detectChanges();
          return of(null);
        })
      )
      .subscribe();
  }
}
