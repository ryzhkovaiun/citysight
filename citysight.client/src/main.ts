import { ApplicationConfig, importProvidersFrom } from '@angular/core'
import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';

import { YaConfig, AngularYandexMapsModule } from 'angular8-yandex-maps';

import { AppComponent } from './app/app.component';

const config: YaConfig = {
  apikey: '04f854f8-bafb-4c64-9e41-46bfadc82c5d'
};

const applicationConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(AngularYandexMapsModule.forRoot(config)),
    provideHttpClient()
  ]
};

bootstrapApplication(AppComponent, applicationConfig);
