import { ChangeDetectorRef, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { AlertaService } from "../services/alerta.service";

export class General {

  protected router = inject(Router);
  protected activatedRoute = inject(ActivatedRoute);
  protected changeDetectorRef = inject(ChangeDetectorRef);
  protected alerta = inject(AlertaService)
  protected store = inject(Store)
  protected tipo = '';
  protected modelo = '';

  constructor() { }

}
