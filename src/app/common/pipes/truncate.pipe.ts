import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 20, completeWords: boolean = false, ellipsis: string = '...'): string {
    if (!value) return '';
    
    if (value.length <= limit) {
      return value;
    }
    
    if (completeWords) {
      const truncated = value.substring(0, limit);
      const lastSpaceIndex = truncated.lastIndexOf(' ');
      
      if (lastSpaceIndex > 0) {
        return truncated.substring(0, lastSpaceIndex) + ellipsis;
      }
    }
    
    return value.substring(0, limit) + ellipsis;
  }
}
