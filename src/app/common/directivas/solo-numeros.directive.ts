import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appSoloNumeros]',
  standalone: true,
})
export class SoloNumerosDirective {
  @Input('appSoloNumeros') appSoloNumeros: any;

  private regex: RegExp = new RegExp(/^[0-9]*$/);

  @HostListener('input', ['$event'])
  onInput(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (this.appSoloNumeros === false) {
      return input.value;
    } else {
      if (!this.regex.test(input.value)) {
        input.value = input.value.replace(/[^0-9]/g, '');
      }

      return input.value;
    }
  }
}
