import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: true,
})
export class SafeUrlPipe implements PipeTransform {
  private _sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeResourceUrl | null {
    if (!value) return null;
    return this._sanitizer.bypassSecurityTrustResourceUrl(value);
  }
}
