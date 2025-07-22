import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatFecha', standalone: true })
export class FormatFechaPipe implements PipeTransform {
  transform(fechaISO: string, formato: string): string {
    if (!fechaISO) return '';
    
    const fecha = new Date(fechaISO);
    
    // Ajustar a la zona horaria de Colombia (UTC-5)
    const offsetColombia = -5 * 60 * 60 * 1000; // -5 horas en milisegundos
    const fechaColombia = new Date(fecha.getTime() + offsetColombia);
    
    // Obtener componentes de fecha/hora
    const año = fechaColombia.getUTCFullYear();
    const mes = String(fechaColombia.getUTCMonth() + 1).padStart(2, '0');
    const dia = String(fechaColombia.getUTCDate()).padStart(2, '0');
    let horas = fechaColombia.getUTCHours();
    const minutos = String(fechaColombia.getUTCMinutes()).padStart(2, '0');
    const segundos = String(fechaColombia.getUTCSeconds()).padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    
    // Convertir a formato 12 horas
    horas = horas % 12;
    horas = horas ? horas : 12; // Las 0 horas se convierten en 12 AM
    const horas12 = String(horas).padStart(2, '0');

    // Formato 24 horas para combinaciones con fecha
    const horas24 = String(fechaColombia.getUTCHours()).padStart(2, '0');

    switch (formato) {
      case 'Y-m-d':
        return `${año}-${mes}-${dia}`;
      case 'H:i':
        return `${horas12}:${minutos} ${ampm}`;
      case 'H:i:s':
        return `${horas12}:${minutos}:${segundos} ${ampm}`;
      case 'Y-m-d H:i':
        return `${año}-${mes}-${dia} ${horas12}:${minutos} ${ampm}`;
      case 'Y-m-d H:i:s':
        return `${año}-${mes}-${dia} ${horas12}:${minutos}:${segundos} ${ampm}`;
      case 'Y-m-d H:i (24h)':
        return `${año}-${mes}-${dia} ${horas24}:${minutos}`;
      case 'Y-m-d H:i:s (24h)':
        return `${año}-${mes}-${dia} ${horas24}:${minutos}:${segundos}`;
      case 'd/m/Y H:i':
        return `${dia}/${mes}/${año} ${horas12}:${minutos} ${ampm}`;
      case 'H:i (militar)': 
        return `${horas24}:${minutos}`;
      case 'Y-m-d H:i (militar)':
        return `${año}-${mes}-${dia} ${horas24}:${minutos}`;
      case 'd/m/Y H:i (militar)':
        return `${dia}/${mes}/${año} ${horas24}:${minutos}`;
      default:
        return fechaISO;
    }
  }
}