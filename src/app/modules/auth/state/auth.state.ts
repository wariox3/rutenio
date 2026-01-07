import { signal, computed, Injectable } from '@angular/core';
import { Usuario } from '../../../interfaces/user/user.interface';

@Injectable({ providedIn: 'root' })
export class AuthState {
  private readonly _user = signal<Usuario | null>(null);
  public readonly user = this._user.asReadonly();
  public readonly isAuthenticated = computed(() => !!this._user());

  setUser(user: Usuario) {
    this._user.set(user);
  }

  clear() {
    this._user.set(null);
  }
}
