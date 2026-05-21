import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

fetch('/config.json')
  .then((res) => res.json())
  .then((config) => {
    (window as any).appConfig = config;
  })
  .catch((err) => {
    console.warn('Could not load config.json, using default fallback URLs.', err);
  })
  .finally(() => {
    bootstrapApplication(App, appConfig).catch((err) => console.error(err));
  });
