import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { appProviders } from './app/app.providers';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), ...appProviders],
}).catch((err) => console.error(err));
