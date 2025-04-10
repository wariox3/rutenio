import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertir_valor_moneda',
  standalone: true,
})
export class ConvertirValorMonedaPipe implements PipeTransform {
  transform(value: number | string): string {
    // Convertir el valor a número
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Verificar si el valor es un número válido
    if (isNaN(numericValue)) {
      return '$0.00';
    }
    
    // Formatear como moneda colombiana con el formato específico solicitado
    return '$' + numericValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}