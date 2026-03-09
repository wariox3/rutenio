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
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { HeaderComponent } from '../../layouts/header/header.component';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { SearchModalComponent } from '../../partials/search-modal/search-modal.component';
import KTLayout from '../../../metronic/app/layouts/demo1';
import { AlertaSuspensionComponent } from "../../common/components/alerta-suspension/alerta-suspension.component";
import { ModalStandardComponent } from '../../common/components/ui/modals/modal-standard/modal-standard.component';
import { ModalService } from '../../common/components/ui/modals/service/modal.service';
import { TutorialComponent } from '../../common/components/tutorial/tutorial.component';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { obtenerConfiguracionDireccionOrigenVacia } from '../../redux/selectors/configuracion.selectors';
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
  private destroy$ = new Subject<void>();

  public mostrarModalConfiguracion = signal<boolean>(true);

  ngOnInit(): void {
    // Suscripción ÚNICA y reactiva al selector
    // Se actualizará automáticamente cuando cambie la configuración en el store
    this.store
      .select(obtenerConfiguracionDireccionOrigenVacia)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (estaVacia) => {
          // setTimeout para asegurar que el DOM esté listo
          setTimeout(() => {
            if (estaVacia && !this.tutorialService.tourActivo()) {
              this.mostrarModalConfiguracion.set(true);
              this.modalService.open('modalConfiguracionDireccion');
            } else if (estaVacia && this.tutorialService.tourActivo()) {
              this.mostrarModalConfiguracion.set(false);
            } else {
              this.mostrarModalConfiguracion.set(false);
              this.modalService.close('modalConfiguracionDireccion');
            }
            this.cdr.detectChanges();
          }, 0);
        }
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
