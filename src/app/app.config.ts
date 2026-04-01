// src/app/app.config.ts
import { routes } from './app.routes';
import { provideRouter } from '@angular/router';

export const appConfig = [
  provideRouter(routes)
];