import { AbstractControl, ValidationErrors } from '@angular/forms';

export class NoSoloEspacios {
  /**
   * Validador que rechaza valores que contengan solo espacios en blanco
   * @param control AbstractControl
   * @returns ValidationErrors | null
   */
  static validar(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Si no hay valor, deja que otros validadores manejen required
    }
    
    const valor = control.value.toString().trim();
    
    if (valor.length === 0) {
      return { soloEspacios: true };
    }
    
    return null;
  }
}
