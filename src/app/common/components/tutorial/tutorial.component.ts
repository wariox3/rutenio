import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TutorialService, PasoTutorial } from './tutorial.service';

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tutorial.component.html',
  styleUrl: './tutorial.component.scss',
})
export class TutorialComponent {
  tutorialService = inject(TutorialService);
  private router = inject(Router);

  navegarAPaso(paso: PasoTutorial, indice: number): void {
    this.tutorialService.irAPaso(indice);
    this.router.navigate([paso.ruta]);
  }

  marcarCompletado(paso: PasoTutorial, evento: Event): void {
    evento.stopPropagation();
    this.tutorialService.completarPaso(paso.id);
  }
}
