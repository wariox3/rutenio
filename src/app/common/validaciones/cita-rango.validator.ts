import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CitaRangoValidator {
  static validar(control: AbstractControl): ValidationErrors | null {
    const citaInicio = control.get('cita_inicio')?.value;
    const citaFin = control.get('cita_fin')?.value;

    if (!citaInicio && !citaFin) {
      return null;
    }

    if ((citaInicio && !citaFin) || (!citaInicio && citaFin)) {
      return { citaInvalida: 'Debe llenar ambos campos de cita (inicio y fin)' };
    }

    const inicioDay = citaInicio.substring(0, 10);
    const finDay = citaFin.substring(0, 10);

    if (inicioDay !== finDay) {
      return { citaInvalida: 'La cita inicio y fin deben ser del mismo día' };
    }

    if (citaFin <= citaInicio) {
      return { citaInvalida: 'La cita fin debe ser mayor que la cita inicio' };
    }

    return null;
  }
}
