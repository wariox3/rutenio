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

    // Formato 24 horas para combinaciones con fecha
    const horas24 = String(fecha.getHours()).padStart(2, '0');

    switch (formato) {
      case 'Y-m-d':
        return `${año}-${mes}-${dia}`;
      case 'H:i':
        return `${horas12}:${minutos} ${ampm}`; // Formato 12 horas con AM/PM (sin segundos)
      case 'H:i:s':
        return `${horas12}:${minutos}:${segundos} ${ampm}`; // Formato 12 horas con AM/PM y segundos
      case 'Y-m-d H:i':
        return `${año}-${mes}-${dia} ${horas12}:${minutos} ${ampm}`; // Fecha + hora 12h
      case 'Y-m-d H:i:s':
        return `${año}-${mes}-${dia} ${horas12}:${minutos}:${segundos} ${ampm}`; // Fecha + hora 12h con segundos
      case 'Y-m-d H:i (24h)':
        return `${año}-${mes}-${dia} ${horas24}:${minutos}`; // Fecha + hora 24h
      case 'Y-m-d H:i:s (24h)':
        return `${año}-${mes}-${dia} ${horas24}:${minutos}:${segundos}`; // Fecha + hora 24h con segundos
      case 'd/m/Y H:i':
        return `${dia}/${mes}/${año} ${horas12}:${minutos} ${ampm}`; // Formato día/mes/año + hora
      default:
        return fechaISO;
    }
  }
}