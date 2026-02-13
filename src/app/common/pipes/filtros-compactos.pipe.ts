import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtrosCompactos',
  standalone: true
})
export class FiltrosCompactosPipe implements PipeTransform {

  transform(valoresFiltrados: string): string {
    if (!valoresFiltrados || valoresFiltrados.trim() === '') {
      return '';
    }

    // Split by comma and process each filter value
    const valores = valoresFiltrados.split(',').map(valor => valor.trim());
    const valoresFormateados: string[] = [];

    valores.forEach(valor => {
      if (valor === '') return;
      
      // Handle boolean values
      if (valor.toLowerCase() === 'true') {
        valoresFormateados.push('Sí');
      } else if (valor.toLowerCase() === 'false') {
        valoresFormateados.push('No');
      } 
      // Handle numeric values (keep as is but limit length)
      else if (!isNaN(Number(valor))) {
        valoresFormateados.push(valor);
      }
      // Handle text values (truncate if too long)
      else {
        if (valor.length > 15) {
          valoresFormateados.push(valor.substring(0, 12) + '...');
        } else {
          valoresFormateados.push(valor);
        }
      }
    });

    // Limit total number of displayed filters to keep it compact
    if (valoresFormateados.length > 3) {
      const primerosTres = valoresFormateados.slice(0, 3);
      const restantes = valoresFormateados.length - 3;
      return `${primerosTres.join(' • ')} +${restantes}`;
    }

    return valoresFormateados.join(' • ');
  }
}
