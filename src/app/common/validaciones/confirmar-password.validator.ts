import { AbstractControl, ValidationErrors } from '@angular/forms';

export class ConfirmarPasswordValidator {
  /**
   * Check matching password with confirm password
   * @param control AbstractControl
   */
  static validarClave(control: AbstractControl): ValidationErrors | null {
    const clave = control.get('clave')?.value;
    const confirmarClave = control.get('confirmarClave')?.value;

    if (!clave || !confirmarClave) {
      return null; // No validar si alguno está vacío
    }

    if (clave !== confirmarClave) {
      // Establecer error en el campo confirmarClave
      control.get('confirmarClave')?.setErrors({ clavesDiferentes: true });
      // También retornar error a nivel de formulario
      return { clavesDiferentes: true };
    } else {
      // Limpiar error si las contraseñas coinciden
      const confirmarClaveControl = control.get('confirmarClave');
      if (confirmarClaveControl?.errors?.['clavesDiferentes']) {
        const errors = { ...confirmarClaveControl.errors };
        delete errors['clavesDiferentes'];
        confirmarClaveControl.setErrors(Object.keys(errors).length ? errors : null);
      }
      return null;
    }
  }

  // Tus otros métodos pueden permanecer igual o aplicar lógica similar
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