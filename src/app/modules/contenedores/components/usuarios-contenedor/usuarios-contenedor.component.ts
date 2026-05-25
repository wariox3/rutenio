import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { createFeatureSelector, Store } from '@ngrx/store';
import { Contenedor, ContenedorLista } from '../../interfaces/contenedor.interface';
import { ContenedorInvitarComponent } from '../contenedor-invitar/contenedor-invitar.component';

const obtenerContenedorState = createFeatureSelector<Contenedor>('contenedor');

/**
 * Pantalla dedicada de gestion de miembros del contenedor activo. Antes
 * solo se llegaba via /contenedor/lista → engranaje → "Invitar" (modal
 * embebida). Esta pantalla envuelve ContenedorInvitarComponent y le
 * pasa el contenedor seleccionado actualmente.
 */
@Component({
  selector: 'app-usuarios-contenedor',
  standalone: true,
  imports: [CommonModule, ContenedorInvitarComponent],
  templateUrl: './usuarios-contenedor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UsuariosContenedorComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private cdr = inject(ChangeDetectorRef);
  private _destroy$ = new Subject<void>();

  public contenedor: ContenedorLista | null = null;

  ngOnInit(): void {
    this.store
      .select(obtenerContenedorState)
      .pipe(takeUntil(this._destroy$))
      .subscribe((c) => {
        this.contenedor = c && c.contenedor_id
          ? this._mapearAContenedorLista(c)
          : null;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Adapta el shape del store (Contenedor) al que espera el
   * ContenedorInvitarComponent (ContenedorLista, con los campos
   * doble-guion-bajo del backend).
   */
  private _mapearAContenedorLista(c: Contenedor): ContenedorLista {
    return {
      ...c,
      contenedor: c.nombre,
      contenedor__nombre: c.nombre,
      contenedor__usuarios: c.usuarios ?? 0,
      contenedor__imagen: c.imagen,
      contenedor__schema_name: c.subdominio,
      contenedor__reddoc: c.reddoc,
      contenedor__ruteo: c.ruteo,
      contenedor__plan_id: c.plan_id ?? 0,
      contenedor__plan__nombre: c.plan_nombre ?? '',
      contenedor__plan__usuarios_base: c.usuarios_base ?? 0,
    } as ContenedorLista;
  }
}
