import { AbstractControl, Validators } from '@angular/forms';

export class cambiarVacioPorNulo {
  /**
    Obtiene el campo que tenga la validación y convierte el valor vacio a nulo
   * @param control AbstractControl
   */
  static validar(control: AbstractControl): Validators | null {
    if (control.value === '') {
      control.setValue(null, { emitEvent: false }); 
    }
    return null;
  }
}
