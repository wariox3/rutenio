import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

interface Modal {
  id: string;
  isOpen: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modals$ = new BehaviorSubject<Modal[]>([]);

  register(id: string) {
    const currentModals = this.modals$.value;
    if (!currentModals.find((m) => m.id === id)) {
      this.modals$.next([...currentModals, { id, isOpen: false }]);
    }
  }

  unregister(id: string) {
    const currentModals = this.modals$.value;
    this.modals$.next(currentModals.filter((m) => m.id !== id));
  }

  open(id: string) {
    const currentModals = this.modals$.value;
    this.modals$.next(currentModals.map((m) => (m.id === id ? { ...m, isOpen: true } : m)));
  }

  close(id: string) {
    const currentModals = this.modals$.value;
    this.modals$.next(currentModals.map((m) => (m.id === id ? { ...m, isOpen: false } : m)));
  }

  isOpen$(id: string) {
    return this.modals$
      .asObservable()
      .pipe(map((modals) => modals.find((m) => m.id === id)?.isOpen ?? false));
  }
}
