import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch(() => {
  const message = document.createElement('main');
  message.className = 'startup-error';
  message.setAttribute('role', 'alert');
  message.textContent = 'Could not start the weather app. Please reload the page.';

  const root = document.querySelector('app-root');
  if (root) {
    root.replaceChildren(message);
  } else {
    document.body.append(message);
  }
});
