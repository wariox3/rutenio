import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class WebPushService {
  private _http = inject(HttpService);

  async activar(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const reg = await navigator.serviceWorker.register('/push-sw.js');
      const permiso = await Notification.requestPermission();
      if (permiso !== 'granted') return;

      const { key } = await firstValueFrom(
        this._http.getDetalle<{ key: string }>(
          'ruteo/seguimiento/vapid-public-key/'
        )
      );
      if (!key) return;

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this._urlB64ToUint8Array(key),
        });
      }
      await firstValueFrom(
        this._http.post('ruteo/seguimiento/push-subscription/', {
          subscription: sub.toJSON(),
        })
      );
    } catch {
      /* push es best-effort; el chat en vivo (WS) y el poll cubren el resto */
    }
  }

  private _urlB64ToUint8Array(base64: string): Uint8Array {
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(b64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return arr;
  }
}
