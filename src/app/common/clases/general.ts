import { ChangeDetectorRef, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
// import { AlertaService } from "../servicios/alerta.service";
import { Store } from "@ngrx/store";

export class General {

  protected router = inject(Router);
  protected activatedRoute = inject(ActivatedRoute);
  protected changeDetectorRef = inject(ChangeDetectorRef);
  // protected alerta = inject(AlertaService)
  protected store = inject(Store)
  protected tipo = '';
  protected modelo = '';

  constructor() { }

}
