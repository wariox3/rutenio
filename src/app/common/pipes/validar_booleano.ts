import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'validarBooleano',
  standalone: true,
})
export class ValidarBooleanoPipe implements PipeTransform {
  transform(value: boolean): string {
    return value ? 'SI' : 'NO';
  }
}
