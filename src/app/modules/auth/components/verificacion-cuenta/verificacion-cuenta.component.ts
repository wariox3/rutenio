import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { General } from '../../../../common/clases/general';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verificacion-cuenta',
  templateUrl: './verificacion-cuenta.component.html',
  styleUrls: ['./verificacion-cuenta.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export default class VerificacionCuentaComponent extends General implements OnInit {
  private authService = inject(AuthService);

  verificacionToken: 'exitosa' | 'error' | 'cargando' = 'cargando';
  verficacionErrorMensaje = '';
  codigoUsuario: number | null = null;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.consultarValidacion();
  }

  consultarValidacion() {
    const token = this.activatedRoute.snapshot.paramMap.get('token')!;
    this.authService.validacion(token).subscribe({
      next: (): void => {
        this.alerta.mensajaExitoso('Se ha verificado la cuenta exitosamente.');
        this.verificacionToken = 'exitosa';
        this.changeDetectorRef.detectChanges(); 
      },
      error: () => {
        this.verificacionToken = 'error';
        this.changeDetectorRef.detectChanges();
      },  
    });
  }

  login() {
    this.router.navigate(['/auth/login']);
  }

  reenviarVerificacion() {
    if (this.codigoUsuario) {
      this.authService.reenviarValidacion(this.codigoUsuario).subscribe({
        next: (respuesta): void => {
          this.alerta.mensajaExitoso('La verificación se ha enviado nuevamente al correo electrónico registrado.'
            //`La nueva verificación se ha enviado nuevamente al correo electrónico registrado. <br> Vence: ${respuesta.verificacion.vence}`
          );
        },
        error: ({ error }): void => {
          this.alerta.mensajeError(
            'Error en la verificación',
            `Código: ${error.codigo} <br/> Mensaje: ${error.mensaje}`
          );
        },
      });
    }
  }
}
