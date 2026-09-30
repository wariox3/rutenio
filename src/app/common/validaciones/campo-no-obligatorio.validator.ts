import { AbstractControl, Validators } from '@angular/forms';

export class cambiarVacioPorNulo {
  static validar(control: AbstractControl): Validators | null {
    if (control.value === '') {
      control.setValue(null, { emitEvent: false }); 
    }
    return null;
  }
}
