import { AbstractControl, ValidationErrors } from '@angular/forms';

const PATRON_CARACTERES = /^[0-9+\-\s()]+$/;

export class TelefonoWhatsappValidator {
  static validar(control: AbstractControl): ValidationErrors | null {
    const valor = (control.value ?? '').toString().trim();
    if (!valor) return null;

    if (!PATRON_CARACTERES.test(valor)) {
      return { telefonoFormato: true };
    }

    const digitos = valor.replace(/\D/g, '');
    if (digitos.length < 10) return { telefonoCorto: true };
    if (digitos.length > 15) return { telefonoLargo: true };
    return null;
  }

  static esCelularCO(valor: string | null | undefined): boolean {
    if (!valor) return false;
    const digitos = valor.toString().replace(/\D/g, '');
    if (digitos.length === 10 && digitos.startsWith('3')) return true;
    if (digitos.length === 12 && digitos.startsWith('573')) return true;
    return false;
  }
}
