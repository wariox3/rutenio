import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { HeaderComponent } from '../../layouts/header/header.component';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { SearchModalComponent } from '../../partials/search-modal/search-modal.component';
import KTLayout from '../../../metronic/app/layouts/demo1';
import { AlertaSuspensionComponent } from "../../common/components/alerta-suspension/alerta-suspension.component";
import { ModalStandardComponent } from '../../common/components/ui/modals/modal-standard/modal-standard.component';
import { ModalService } from '../../common/components/ui/modals/service/modal.service';
import { TutorialComponent } from '../../common/components/tutorial/tutorial.component';
import { Subject, combineLatest, filter, take, takeUntil, throttleTime } from 'rxjs';
import { Store } from '@ngrx/store';
import { obtenerConfiguracionDireccionOrigenVacia } from '../../redux/selectors/configuracion.selectors';
import { obtenerContenedorId, obtenerPermisoPor } from '../../redux/selectors/contenedor.selector';
import { ContenedorActionActualizarPermisos } from '../../redux/actions/contenedor/contenedor.actions';
import { ContenedorService } from '../../modules/contenedores/services/contenedor.service';
import { TutorialService } from '../../common/components/tutorial/tutorial.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FooterComponent,
    SidebarComponent,
    SearchModalComponent,
    HeaderComponent,
    AlertaSuspensionComponent,
    ModalStandardComponent,
    TutorialComponent,
],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminLayoutComponent implements AfterViewInit, OnInit, OnDestroy {
  private store = inject(Store);
  private modalService = inject(ModalService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private tutorialService = inject(TutorialService);
  private contenedorService = inject(ContenedorService);
  private destroy$ = new Subject<void>();

  public mostrarModalConfiguracion = signal<boolean>(true);

  ngOnInit(): void {
    this._refrescarPermisos();

    // admin-layout no se remonta entre rutas hijas del mismo parent, por lo
    // que ngOnInit no vuelve a correr en cada navegacion; throttle de 5s.
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        throttleTime(5000),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this._refrescarPermisos());

    // Solo se muestra a quien tiene permiso configuracion.editar, para no
    // empujar a operativo/consulta a un dead-end sin boton Guardar.
    combineLatest([
      this.store.select(obtenerConfiguracionDireccionOrigenVacia),
      this.store.select(obtenerPermisoPor('configuracion', 'editar')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([estaVacia, puedeEditar]) => {
          setTimeout(() => {
            const debeMostrar = estaVacia && puedeEditar;
            if (debeMostrar && !this.tutorialService.tourActivo()) {
              this.mostrarModalConfiguracion.set(true);
              this.modalService.open('modalConfiguracionDireccion');
            } else if (debeMostrar && this.tutorialService.tourActivo()) {
              this.mostrarModalConfiguracion.set(false);
            } else {
              this.mostrarModalConfiguracion.set(false);
              this.modalService.close('modalConfiguracionDireccion');
            }
            this.cdr.detectChanges();
          }, 0);
        },
      });
  }

  private _refrescarPermisos(): void {
    this.store
      .select(obtenerContenedorId)
      .pipe(take(1))
      .subscribe((id) => {
        const contenedorId = Number(id);
        if (!contenedorId || isNaN(contenedorId)) return;
        this.contenedorService.miMembresia(contenedorId).subscribe({
          next: (m) => {
            this.store.dispatch(
              ContenedorActionActualizarPermisos({
                rol: m.rol,
                tiene_acceso_web: m.tiene_acceso_web,
                tiene_acceso_movil: m.tiene_acceso_movil,
                perfil_movil: m.perfil_movil,
                permisos: m.permisos,
              }),
            );
          },
          error: () => {
            this.router.navigate(['/contenedor/lista']);
          },
        });
      });
  }


  ngAfterViewInit(): void {
    KTLayout.init();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navegarAConfiguracion(): void {
    this.modalService.close('modalConfiguracionDireccion');
    this.router.navigate(['/configuracion']);
  }
}
