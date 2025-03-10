import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'redondear',
  standalone: true,
})
export class RedondearPipe implements PipeTransform {
  transform(value: number, decimalPlaces: number = 0): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(value * factor) / factor;
  }
}
