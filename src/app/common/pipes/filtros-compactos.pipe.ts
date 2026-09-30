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

    const valores = valoresFiltrados.split(',').map(valor => valor.trim());
    const valoresFormateados: string[] = [];

    valores.forEach(valor => {
      if (valor === '') return;

      if (valor.toLowerCase() === 'true') {
        valoresFormateados.push('Sí');
      } else if (valor.toLowerCase() === 'false') {
        valoresFormateados.push('No');
      }
      else if (!isNaN(Number(valor))) {
        valoresFormateados.push(valor);
      }
      else {
        if (valor.length > 15) {
          valoresFormateados.push(valor.substring(0, 12) + '...');
        } else {
          valoresFormateados.push(valor);
        }
      }
    });

    if (valoresFormateados.length > 3) {
      const primerosTres = valoresFormateados.slice(0, 3);
      const restantes = valoresFormateados.length - 3;
      return `${primerosTres.join(' • ')} +${restantes}`;
    }

    return valoresFormateados.join(' • ');
  }
}
