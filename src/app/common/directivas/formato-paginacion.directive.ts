import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appFormatoPaginacion]',
  standalone: true,
})
export class FormatoPaginacionDirective {
  @Input('appSoloNumeros') appSoloNumeros: any;

  private regex: RegExp = new RegExp(/^[0-9]*-?[0-9]*$/);

  @HostListener('input', ['$event'])
  onInput(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (this.appSoloNumeros === false) {
      return input.value;
    } else {
      // Verifica que el valor cumpla con la expresión regular.
      if (!this.regex.test(input.value)) {
        // Elimina caracteres no permitidos y asegura un único guion.
        let cleanValue = input.value.replace(/[^0-9-]/g, ''); // Elimina caracteres no numéricos ni guion.

        // Asegura que solo haya un guion.
        const parts = cleanValue.split('-');
        if (parts.length > 2) {
          cleanValue = `${parts[0]}-${parts.slice(1).join('')}`;
        }

        // Reemplaza cualquier guion después del último número.
        cleanValue = cleanValue.replace(/-+$/, '');

        input.value = cleanValue;
      }
      
      return input.value;
    }
  }
}
