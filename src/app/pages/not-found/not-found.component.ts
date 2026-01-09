import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../common/components/ui/button/button.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full text-center">
        <div class="mb-8">
          <h1 class="text-9xl font-bold text-gray-300">404</h1>
          <h2 class="text-2xl font-semibold text-gray-700 mb-4">Página no encontrada</h2>
          <p class="text-gray-500 mb-8">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
        </div>
        
        <div class="space-y-4">
          <button
            (click)="goHome()"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
          >Volver al inicio</button>
          
          <button
            (click)="goBack()"
            class="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Volver atrás
          </button>
        </div>
        
        <div class="mt-8 text-sm text-gray-400">
          <p>Si crees que esto es un error, por favor contacta al administrador.</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export default class NotFoundComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    window.history.back();
  }
}
