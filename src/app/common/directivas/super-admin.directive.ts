import {
  Directive,
  inject,
  Input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { obtenerEsSuperAdmin } from '../../redux/selectors/auth.selector';

@Directive({
  selector: '[appSuperAdmin]',
  standalone: true,
})
export class SuperAdminDirective implements OnDestroy {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private store = inject(Store);

  private _destroy$ = new Subject<void>();
  private _expected = true;
  private _ultimoEstado: boolean | null = null;

  @Input() set appSuperAdmin(valor: boolean | '' | undefined) {
    this._expected = valor === false ? false : true;
    this._evaluar(this._ultimoEstado);
  }

  ngOnInit() {
    this.store
      .select(obtenerEsSuperAdmin)
      .pipe(takeUntil(this._destroy$))
      .subscribe((es) => {
        this._ultimoEstado = !!es;
        this._evaluar(this._ultimoEstado);
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _evaluar(es: boolean | null) {
    if (es === null) return;
    const debeMostrar = this._expected ? es : !es;
    this.viewContainer.clear();
    if (debeMostrar) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
