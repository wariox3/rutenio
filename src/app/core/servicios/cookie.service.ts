import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

export interface CookieOptions {
  path?: string;
  domain?: string;
  expires?: Date | string | number;
  maxAge?: number;
  secure?: boolean;
  sameSite?: 'Lax' | 'Strict' | 'None';
  httpOnly?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CookieService {
  private readonly documentIsAccessible: boolean;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.documentIsAccessible = isPlatformBrowser(this.platformId);
  }

  get(name: string): string | null {
    if (!this.documentIsAccessible) {
      return null;
    }

    const encodedName = encodeURIComponent(name);
    const cookies = this.document.cookie.split('; ');

    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split('=');
      if (cookieName === encodedName) {
        return decodeURIComponent(cookieValue);
      }
    }

    return null;
  }

  set(name: string, value: string, options: CookieOptions = {}): void {
    if (!this.documentIsAccessible) {
      return;
    }

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.expires) {
      let expiresDate: Date;

      if (typeof options.expires === 'number') {
        expiresDate = new Date();
        expiresDate.setTime(expiresDate.getTime() + options.expires * 1000);
      } else if (typeof options.expires === 'string') {
        expiresDate = new Date(options.expires);
      } else {
        expiresDate = options.expires;
      }

      cookieString += `; expires=${expiresDate.toUTCString()}`;
    } else if (options.maxAge) {
      cookieString += `; max-age=${options.maxAge}`;
    }

    if (options.secure) {
      cookieString += '; secure';
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    if (options.httpOnly && this.isHttpOnlySupported()) {
      cookieString += '; httponly';
    }

    this.document.cookie = cookieString;
  }

  delete(name: string, path?: string, domain?: string): void {
    this.set(name, '', {
      path,
      domain,
      maxAge: -1,
    });
  }

  has(name: string): boolean {
    if (!this.documentIsAccessible) {
      return false;
    }

    return this.get(name) !== null;
  }

  getAll(): Record<string, string> {
    if (!this.documentIsAccessible) {
      return {};
    }

    const cookies = this.document.cookie.split('; ');
    const result: Record<string, string> = {};

    for (const cookie of cookies) {
      const [encodedName, encodedValue] = cookie.split('=');
      const name = decodeURIComponent(encodedName);
      const value = decodeURIComponent(encodedValue);
      result[name] = value;
    }

    return result;
  }

  calcularTiempoCookie(hora: number) {
    return new Date(new Date().getTime() + hora * 60 * 60 * 1000);
  }

  private isHttpOnlySupported(): boolean {
    // HttpOnly no puede establecerse desde JavaScript en navegadores modernos
    return false;
  }
}
