import { AbstractControl, ValidationErrors } from '@angular/forms';

export class ConfirmarPasswordValidator {
  static validarClave(control: AbstractControl): ValidationErrors | null {
    const clave = control.get('clave')?.value;
    const confirmarClave = control.get('confirmarClave')?.value;

    if (!clave || !confirmarClave) {
      return null;
    }

    if (clave !== confirmarClave) {
      control.get('confirmarClave')?.setErrors({ clavesDiferentes: true });
      return { clavesDiferentes: true };
    } else {
      const confirmarClaveControl = control.get('confirmarClave');
      if (confirmarClaveControl?.errors?.['clavesDiferentes']) {
        const errors = { ...confirmarClaveControl.errors };
        delete errors['clavesDiferentes'];
        confirmarClaveControl.setErrors(Object.keys(errors).length ? errors : null);
      }
      return null;
    }
  }

  static validarCambioClave(control: AbstractControl): ValidationErrors | null {
    const clave = control.get('nuevaClave')?.value;
    const confirmarClave = control.get('confirmarNuevaClave')?.value;

    if (!clave || !confirmarClave) {
      return null;
    }

    if (clave !== confirmarClave) {
      control.get('confirmarNuevaClave')?.setErrors({ clavesDiferentes: true });
      return { clavesDiferentes: true };
    } else {
      const confirmarClaveControl = control.get('confirmarNuevaClave');
      if (confirmarClaveControl?.errors?.['clavesDiferentes']) {
        const errors = { ...confirmarClaveControl.errors };
        delete errors['clavesDiferentes'];
        confirmarClaveControl.setErrors(Object.keys(errors).length ? errors : null);
      }
      return null;
    }
  }

  static validarClaveDiferentes(control: AbstractControl): ValidationErrors | null {
    const claveAnterior = control.get('claveAnterior')?.value;
    const nuevaClave = control.get('nuevaClave')?.value;

    if (claveAnterior && nuevaClave && claveAnterior === nuevaClave) {
      control.get('nuevaClave')?.setErrors({ clavesDiferentes: true });
      return { clavesDiferentes: true };
    } else {
      const nuevaClaveControl = control.get('nuevaClave');
      if (nuevaClaveControl?.errors?.['clavesDiferentes']) {
        const errors = { ...nuevaClaveControl.errors };
        delete errors['clavesDiferentes'];
        nuevaClaveControl.setErrors(Object.keys(errors).length ? errors : null);
      }
      return null;
    }
  }
}