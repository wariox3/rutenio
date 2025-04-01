import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatFecha', standalone: true })
export class FormatFechaPipe implements PipeTransform {
  transform(fechaISO: string, formato: string): string {
    if (!fechaISO) return '';
    
    const fecha = new Date(fechaISO);
    
    // Formateo manual (sin librerías externas)
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    let horas = fecha.getHours();
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    
    // Convertir a formato 12 horas
    horas = horas % 12;
    horas = horas ? horas : 12; // Las 0 horas se convierten en 12 AM
    const horas12 = String(horas).padStart(2, '0');

    switch (formato) {
      case 'Y-m-d':
        return `${año}-${mes}-${dia}`;
      case 'H:i':
        return `${horas12}:${minutos} ${ampm}`; // Formato 12 horas con AM/PM (sin segundos)
      case 'H:i:s':
        return `${horas12}:${minutos}:${segundos} ${ampm}`; // Formato 12 horas con AM/PM y segundos
      default:
        return fechaISO;
    }
  }
}