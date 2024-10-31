import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { EffectsApp, StoreApp } from './redux';
import { tokenInterceptor } from './common/interceptors/token.interceptor';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([tokenInterceptor]),
      withInterceptorsFromDi()
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideStore(StoreApp),
    provideEffects(EffectsApp),
    // importProvidersFrom(
    //   provideStoreDevtools({
    //     maxAge: 25,
    //     logOnly: environment.production,
    //   })
    // ),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideHttpClient(),
  ],
};
