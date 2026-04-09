import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

// ✅ ADD THESE
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),

    // ✅ ADD THIS LINE
    provideHttpClient(withInterceptors([authInterceptor]))
    
  ]
}).catch(err => console.error(err));