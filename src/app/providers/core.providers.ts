import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';
import { AuthService } from '../modules/auth/services/auth.service';
import { authInitializer } from '../modules/auth/state/auth.initializer';
import { authInterceptor } from '../common/interceptors/token.interceptor';

export const CORE_PROVIDERS = [
  provideHttpClient(
    withInterceptors([authInterceptor])
  ),
  {
    provide: APP_INITIALIZER,
    useFactory: authInitializer,
    deps: [AuthService],
    multi: true
  }
];
