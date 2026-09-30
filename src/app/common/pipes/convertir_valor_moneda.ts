import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertir_valor_moneda',
  standalone: true,
})
export class ConvertirValorMonedaPipe implements PipeTransform {
  transform(value: number | string): string {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
      return '$0.00';
    }

    return '$' + numericValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}